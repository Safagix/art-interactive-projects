import cv2
import os

# --- CRITICAL ENVIRONMENT SETUP ---
# Ensure ffmpeg binaries are available for audio analysis
try:
    from static_ffmpeg import add_paths
    add_paths()
except ImportError:
    pass

import numpy as np
import math
import pyautogui
import time
import threading
import queue
from cvzone.HandTrackingModule import HandDetector
import sys
import os


# Add path to 'cuerpo' folder for avatar
sys.path.append(os.path.abspath(r"g:\Digital Lab\cuerpo"))
from eira_avatar import EiraAvatar

# Import Eira
try:
    from eira_brain import EiraAssistant
except ImportError:
    print("Eira Brain not found. Running in Vision Only mode.")
    EiraAssistant = None

# --- CONFIGURATION ---
CAM_W, CAM_H = 1280, 720
SCREEN_W, SCREEN_H = pyautogui.size()
FRAME_REDUCTION = 100
SMOOTHING = 3

class EiraDigitalLab:
    def __init__(self):
        # 1. Setup Vision
        self.cap = cv2.VideoCapture(0)
        self.cap.set(3, CAM_W)
        self.cap.set(4, CAM_H)
        self.detector = HandDetector(maxHands=1, detectionCon=0.7)
        
        # 2. Setup Input/Output Optimizations
        pyautogui.PAUSE = 0
        pyautogui.FAILSAFE = False
        self.prev_x, self.prev_y = 0, 0
        self.curr_x, self.curr_y = 0, 0
        
        # 3. Setup Eira (The Soul)
        try:
            self.eira = EiraAssistant() if EiraAssistant else None
        except Exception as e:
            print(f"ERROR: Eira Brain failed to initialize: {e}")
            self.eira = None
        self.eira_status = "IDLE" # IDLE, LISTENING, THINKING, SPEAKING
        self.audio_queue = queue.Queue()
        self.cmd_queue = queue.Queue()
        
        # States
        self.paused = False # Mouse Lock
        self.listening_mode = False # Voice Active Mode
        self.palm_start = 0
        
        # 4. Initialize Avatar
        print("🎭 Initializing Avatar...")
        try:
            # The avatar will now use the existing QApplication from the main thread
            self.avatar = EiraAvatar()
            # Connect avatar to brain
            if self.eira:
                self.eira.avatar = self.avatar
                # Setup state change callback
                def on_state_change(state):
                    if self.avatar:
                        if state == "LISTENING":
                            # Use 'smile' or 'thinking' when listening
                            self.avatar.signals.change_expression.emit("smile")
                        elif state == "THINKING":
                            self.avatar.signals.change_expression.emit("thinking")
                        elif state == "SPEAKING":
                            pass
                        else:
                            self.avatar.signals.change_expression.emit("neutral")
                self.eira.on_state_change = on_state_change
            print("✅ Avatar Online")
        except Exception as e:
            print(f"⚠️ Avatar failed to initialize: {e}")
            self.avatar = None

        print("--- EIRA DIGITAL LAB: SYSTEM ONLINE ---")

        # Force Window Creation
        cv2.namedWindow("EIRA DIGITAL LAB", cv2.WINDOW_NORMAL)
        cv2.setWindowProperty("EIRA DIGITAL LAB", cv2.WND_PROP_TOPMOST, 1)

        # Thread control (START LAST to avoid AttributeErrors)
        self.running = True
        self.voice_thread = threading.Thread(target=self.eira_loop, daemon=True)
        self.voice_thread.start()

    def eira_loop(self):
        """Background thread for Voice Logic to avoid freezing video."""
        while self.running:
            if self.listening_mode and self.eira:
                # Logic start
 
                try:
                    # 1. Update UI Status
                    self.eira_status = "LISTENING"
                    
                    # 2. Listen
                    text = self.eira.listen() # This blocks for 5 seconds max
                    
                    if text:
                        self.eira_status = "THINKING"
                        response = self.eira.think(text)
                        
                        self.eira_status = "SPEAKING"
                        # We run speak in a blocking way here in the thread, perfectly fine
                        # But we need an async wrapper call if speak is async def
                        # In eira_brain.py, speak IS async.
                        import asyncio
                        asyncio.run(self.eira.speak(response))
                    else:
                        pass # Noise or silence
                    
                except Exception as e:
                    print(f"ERROR in Eira loop: {e}")
                    self.eira_status = "ERROR"
                finally:
                    # Reset to IDLE after turn (or error)
                    self.listening_mode = False 
                    if self.eira_status != "ERROR": # Don't overwrite a persistent error status
                        self.eira_status = "IDLE"
            
            time.sleep(0.1)

    # --- VISUALIZER HELPERS ---
    def get_audio_level(self):
        """Simulate audio level."""
        # Active Listening/Speaking = High activity
        if self.eira_status == "LISTENING" or self.eira_status == "SPEAKING":
            return np.random.randint(20, 150)
        # Idle but unmuted = Low 'alive' jitter
        elif not self.mic_muted:
             return np.random.randint(2, 10)
        return 0

    def draw_ui(self, img):
        """Draws the HUD and Status Indicators."""
        # Top Left: Eira Status
        
        # Color coding
        if self.eira_status == "IDLE":
            color = (200, 200, 200) # Gray
            icon = "MICRO: STANDBY"
            bar_color = (100, 100, 100)
        elif self.eira_status == "LISTENING":
            color = (0, 255, 0) # Green
            icon = "MICRO: LISTENING..."
            bar_color = (0, 255, 0)
        elif self.eira_status == "THINKING":
            color = (0, 255, 255) # Yellow/Cyan
            icon = "EIRA: THINKING..."
            bar_color = (0, 255, 255)
        elif self.eira_status == "SPEAKING":
            color = (255, 0, 255) # Purple
            icon = "EIRA: SPEAKING..."
            bar_color = (255, 0, 255)
        elif self.eira_status == "ERROR":
            color = (0, 0, 255) # Red
            icon = "MICRO: ERROR (Chk Console)"
            bar_color = (0, 0, 255)
        
        if self.mic_muted:
             icon = "MICRO: MUTED (M)"
             color = (0, 0, 255)
             bar_color = (50, 0, 0)

        # Draw Background Box for Text
        cv2.rectangle(img, (10, 10), (450, 100), (0, 0, 0), cv2.FILLED)
        cv2.putText(img, icon, (30, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        
        # Audio Visualizer Bar
        level = self.get_audio_level()
        # Draw dynamic bars
        cv2.rectangle(img, (30, 60), (30 + level * 3, 80), bar_color, cv2.FILLED)
        cv2.rectangle(img, (30, 60), (330, 80), (255, 255, 255), 2) # Frame

        # Mute Instruction
        cv2.putText(img, "Mute: 'M' | Talk: 'F'", (30, 95), cv2.FONT_HERSHEY_PLAIN, 1, (150, 150, 150), 1)
        
        # Mouse Lock Status
        if self.paused:
             cv2.rectangle(img, (0,0), (CAM_W, CAM_H), (0, 0, 255), 5) # Red Border
             cv2.putText(img, "SYSTEM LOCKED (Gestures Paused)", (300, 400), cv2.FONT_HERSHEY_PLAIN, 3, (0, 0, 255), 3)

    def run(self, qt_app=None):
        dragging = False
        self.mic_muted = False
        
        while self.running:
            # 0. Process Qt Events if app is provided
            if qt_app:
                qt_app.processEvents()
            # 1. VISION LOOP
            success, img = self.cap.read()
            if not success: continue
            img = cv2.flip(img, 1)
            # Draw Hand only if ACTIVE (Hide if LOCKED)
            draw_hand = not self.paused
            hands, img = self.detector.findHands(img, flipType=False, draw=draw_hand)
            
            # 2. DRAW UI
            self.draw_ui(img)
            
            # 3. HAND LOGIC
            if hands:
                hand = hands[0]
                fingers = self.detector.fingersUp(hand)
                lmList = hand['lmList']
                x1, y1 = lmList[8][0], lmList[8][1] # Index
                x2, y2 = lmList[12][0], lmList[12][1] # Middle
                x3, y3 = lmList[4][0], lmList[4][1]   # Thumb
                
                # A. VOICE TRIGGER (Open Palm -> 1s)
                # Only if not muted
                if fingers == [1, 1, 1, 1, 1] and not self.mic_muted:  
                     if self.eira:
                         if self.listening_mode:
                             cv2.putText(img, "VOICE: ACTIVE", (x1-60, y1-40), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 255, 0), 2)
                             cv2.circle(img, (x1, y1), 30, (0, 255, 0), cv2.FILLED)
                         else:
                             # Timer Logic
                             if not hasattr(self, 'palm_start'): self.palm_start = 0
                             if self.palm_start == 0: self.palm_start = time.time()
                             elapsed = time.time() - self.palm_start
                             
                             # Visual Feedback
                             perc = int((elapsed/1.0)*100)
                             if perc > 100: perc = 100
                             
                             cv2.circle(img, (x1, y1), 30, (0, 255, 0), 2)
                             cv2.putText(img, f"VOICE: {perc}%", (x1-40, y1-40), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 255, 0), 2)
                             
                             if elapsed > 1.0:
                                 self.listening_mode = True
                                 self.palm_start = 0
                                 print("TRIGGER: Start Listening...")
                                 # AUDIBLE FEEDBACK
                                 try:
                                     import winsound
                                     winsound.Beep(1000, 200) # High Pitch Beep
                                 except: pass
                     else:
                         cv2.putText(img, "BRAIN OFFLINE", (x1-60, y1-40), cv2.FONT_HERSHEY_PLAIN, 1.5, (0, 0, 255), 2)

                else:
                     # Only reset timer if we are NOT in listening mode (so we don't kill active session by moving hand)
                     # Actually, palm_start needs reset if we drop hand BEFORE trigger.
                     if not self.listening_mode:
                        self.palm_start = 0

                # B. LOCK TOGGLE (Spider-Man 🤟)  
                # Index (1) & Pinky (4) UP. 
                if fingers[1] == 1 and fingers[4] == 1 and fingers[2] == 0:
                     # Check cooldown
                     if not hasattr(self, 'lock_cooldown'): self.lock_cooldown = 0
                     if time.time() - self.lock_cooldown < 3.0: # 3 Seconds wait before toggle again
                         pass
                     else:
                         if not hasattr(self, 'lock_timer'): self.lock_timer = 0
                         if self.lock_timer == 0: self.lock_timer = time.time()
                         
                         # Visual Feedback for Lock
                         elapsed_lock = time.time() - self.lock_timer
                         msg = "UNLOCKING..." if self.paused else "LOCKING..."
                         cv2.putText(img, msg, (x1, y1-50), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
                         
                         # Draw Progress
                         cv2.circle(img, (x1, y1), 30, (0, 0, 255), 2)
                         
                         if elapsed_lock > 1.5:
                             self.paused = not self.paused
                             self.lock_timer = 0 # Reset
                             self.lock_cooldown = time.time() # Start Cooldown
                             
                             state = "PAUSED" if self.paused else "RESUMED"
                             print(f"SYSTEM STATE: {state}")
                             
                             # Feedback Sound
                             try:
                                 import winsound
                                 winsound.Beep(500, 300) # Low Pitch Beep
                             except: pass
                else:
                     self.lock_timer = 0

                # C. MOUSE CONTROL (RESTORED FULL LOGIC)
                if not self.paused:
                   # Coordinates Mapping
                   x3_screen = np.interp(x1, (FRAME_REDUCTION, CAM_W-FRAME_REDUCTION), (0, SCREEN_W))
                   y3_screen = np.interp(y1, (FRAME_REDUCTION, CAM_H-FRAME_REDUCTION), (0, SCREEN_H))
                   self.curr_x = self.prev_x + (x3_screen - self.prev_x) / SMOOTHING
                   self.curr_y = self.prev_y + (y3_screen - self.prev_y) / SMOOTHING
                   self.prev_x, self.prev_y = self.curr_x, self.curr_y

                   x3, y3 = lmList[4][0], lmList[4][1]   # Thumb

                   # 1. SCROLL (Peace Sign ✌️)
                   if fingers[1] == 1 and fingers[2] == 1 and fingers[3] == 0 and fingers[4] == 0:
                        dist_peace, _, _ = self.detector.findDistance((x1, y1), (x2, y2), img)
                        if dist_peace > 40:
                            if y1 < 300: pyautogui.scroll(20)
                            elif y1 > 420: pyautogui.scroll(-20)
                            cv2.putText(img, "SCROLL", (x1, y1-20), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 255), 2)

                   # 2. DRAG (Fist ✊)
                   elif fingers[1] == 0 and fingers[2] == 0 and fingers[3] == 0 and fingers[4] == 0:
                        if not dragging:
                            pyautogui.mouseDown()
                            dragging = True
                        pyautogui.moveTo(self.curr_x, self.curr_y)
                        cv2.circle(img, (x1, y1), 15, (0, 0, 255), cv2.FILLED)
                   
                   else:
                     # Reset States
                     if dragging:
                          pyautogui.mouseUp()
                          dragging = False
                
                   # 3. RIGHT CLICK (Middle + Thumb 🖕)
                   dist_r, _, _ = self.detector.findDistance((x2, y2), (x3, y3), img)
                   if dist_r < 40 and fingers[2] == 1:
                       pyautogui.rightClick()
                       cv2.circle(img, (x2, y2), 15, (0, 255, 255), cv2.FILLED)
                       time.sleep(0.3)

                   # 4. LEFT CLICK (Index + Thumb 👌)
                   elif fingers[1] == 1:
                      dist_l, info, _ = self.detector.findDistance((x1, y1), (x3, y3), img)
                      if dist_l < 40:
                          pyautogui.click()
                          cv2.circle(img, (info[4], info[5]), 15, (0, 255, 0), cv2.FILLED)
                          time.sleep(0.2)
                      else:
                          # Move
                          pyautogui.moveTo(self.curr_x, self.curr_y)
                          cv2.circle(img, (x1, y1), 10, (255, 0, 255), cv2.FILLED)

                   # 5. DESKTOP (Shaka 🤙)
                   if fingers[0] == 1 and fingers[4] == 1 and fingers[1] == 0:
                       if not hasattr(self, 'shaka_timer'): self.shaka_timer = 0
                       if time.time() - self.shaka_timer > 2.0:
                           pyautogui.hotkey('win', 'd')
                           self.shaka_timer = time.time()
                           cv2.putText(img, "DESKTOP", (x1, y1), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 0), 2)
            
             # 4. UI DISPLAY & EXIT
            cv2.imshow("EIRA DIGITAL LAB", img)

            # 5. KEYBOARD CONTROLS
            key = cv2.waitKey(1)
            
            # Check if User Closed Window (X Button) OR pressed ESC
            if (cv2.getWindowProperty("EIRA DIGITAL LAB", cv2.WND_PROP_VISIBLE) < 1) or (key & 0xFF == 27):
                self.running = False
                print("🛑 SHUTDOWN: Stopping Systems...")
                break
            
            elif key == ord('m'): # Mute Toggle
                self.mic_muted = not self.mic_muted
                print(f"Mic Muted: {self.mic_muted}")
            
            elif key == ord('f'): # Force Voice Trigger
                if self.eira and not self.listening_mode:
                    self.listening_mode = True
                    print("KEYBOARD TRIGGER: Start Listening...")
                    try: 
                        import winsound
                        winsound.Beep(1000, 200)
                    except: pass

        # CLEANUP
        self.cap.release()
        cv2.destroyAllWindows()
        print("✅ SYSTEM OFFLINE.")
        import sys
        sys.exit(0) # Force Kill to stop all threads


if __name__ == "__main__":
    from PyQt6.QtWidgets import QApplication
    import sys
    
    # Create the Qt Application in the main thread
    qt_app = QApplication(sys.argv)
    
    lab = EiraDigitalLab()
    
    # We need to run the Qt event loop. 
    # Since OpenCV's waitKey is used for the vision loop, 
    # we can process Qt events manually inside the lab.run loop.
    lab.run(qt_app)
