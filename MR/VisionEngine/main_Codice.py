import cv2
import time
import socket
import json
import threading
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import os
from cvzone.HandTrackingModule import HandDetector
import pyautogui
from filterpy.kalman import KalmanFilter
from collections import deque

# --- CONFIGURATION ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'model', 'gesture_recognizer.task')
UDP_IP = "127.0.0.1"
UDP_PORT_DATA = 4242
UDP_PORT_VIDEO = 4243
JPEG_QUALITY = 50

CAM_W, CAM_H = 1280, 720
SCREEN_W, SCREEN_H = pyautogui.size()
FRAME_REDUCTION = 100
SMOOTHING = 3

# INNOVATION: Temporal Validation
GESTURE_PERSISTENCE_MS = 300  # Gesture must persist 300ms to activate
GESTURE_HISTORY_SIZE = 10

# --- KALMAN FILTER FOR TRAJECTORY SMOOTHING ---
class HandKalmanFilter:
    """Innovation: Kalman Filter to smooth hand tracking and reduce jitter"""
    def __init__(self):
        self.kf = KalmanFilter(dim_x=4, dim_z=2)  # State: [x, y, vx, vy], Measurement: [x, y]
        
        # State transition matrix (constant velocity model)
        dt = 0.033  # ~30fps
        self.kf.F = np.array([[1, 0, dt, 0],
                              [0, 1, 0, dt],
                              [0, 0, 1, 0],
                              [0, 0, 0, 1]])
        
        # Measurement matrix (only observe position)
        self.kf.H = np.array([[1, 0, 0, 0],
                              [0, 1, 0, 0]])
        
        # Process noise
        self.kf.Q *= 0.01
        
        # Measurement noise
        self.kf.R *= 5
        
        # Initial state
        self.kf.x = np.array([0., 0., 0., 0.])
        self.initialized = False
    
    def update(self, x, y):
        """Update filter with new measurement"""
        if not self.initialized:
            self.kf.x = np.array([x, y, 0., 0.])
            self.initialized = True
            return x, y
        
        # Predict
        self.kf.predict()
        
        # Update with measurement
        self.kf.update(np.array([x, y]))
        
        # Return filtered position
        return self.kf.x[0], self.kf.x[1]

# --- GESTURE VALIDATOR (Temporal Persistence) ---
class GestureValidator:
    """Innovation: Prevent false positives by requiring temporal persistence"""
    def __init__(self, persistence_ms=300, history_size=10):
        self.persistence_ms = persistence_ms
        self.history = deque(maxlen=history_size)
        self.current_gesture = "None"
        self.gesture_start_time = None
    
    def validate(self, gesture_name):
        """Returns validated gesture (None if not persistent enough)"""
        current_time = time.time() * 1000  # ms
        
        # Add to history
        self.history.append(gesture_name)
        
        # Check if gesture changed
        if gesture_name != self.current_gesture:
            self.current_gesture = gesture_name
            self.gesture_start_time = current_time
            return None  # New gesture, not validated yet
        
        # Check persistence
        if current_time - self.gesture_start_time >= self.persistence_ms:
            return gesture_name  # Gesture persisted long enough
        
        return None  # Still waiting for persistence

# --- DATA STRUCTURE ---
class VisionState:
    def __init__(self):
        self.lock = threading.Lock()
        self.latest_result = None
        self.running = True
        self.mode = "CVZONE"  # CVZONE or MEDIAPIPE
        # INNOVATION: Add Kalman filter
        self.kalman = HandKalmanFilter()
        # INNOVATION: Add gesture validator
        self.gesture_validator = GestureValidator()

vision_state = VisionState()

# --- UDP SOCKET ---
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

# --- MEDIAPIPE CALLBACK ---
def result_callback(result: vision.GestureRecognizerResult, output_image: mp.Image, timestamp_ms: int):
    with vision_state.lock:
        vision_state.latest_result = result

# --- COMPUTER VISION ENHANCEMENTS ---
def enhance_frame(frame):
    """Innovation: Apply CV optimizations for better detection"""
    # Histogram equalization for better contrast in low light
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.equalizeHist(l)
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    return enhanced

# --- HYBRID ENGINE ---
def main():
    print(f"\n⚡ CÓDICE OPTIMIZED VISION: INITIALIZING...")
    print(f"📡 TARGET: {UDP_IP}:{UDP_PORT_DATA}")
    print(f"🤖 MODE: CVZONE (1 hand) + MEDIAPIPE (2 hands)")
    print(f"🔬 INNOVATIONS: Kalman Filter, Temporal Validation, CV Enhancements\n")

    # 1. SETUP VIDEO
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        cap = cv2.VideoCapture(1)
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAM_W)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAM_H)
    
    # 2. SETUP CVZONE DETECTOR (Optimized)
    detector_cvzone = HandDetector(maxHands=2, detectionCon=0.7)
    
    # 3. SETUP MEDIAPIPE TASKS (Only if 2 hands)
    try:
        with open(MODEL_PATH, 'rb') as f:
            model_buffer = f.read()
            print(f"✅ MediaPipe Model Loaded: {len(model_buffer)} bytes")
    except Exception as e:
        print(f"❌ MEDIAPIPE MODEL LOAD FAILED: {e}")
        return

    base_options = python.BaseOptions(model_asset_buffer=model_buffer)
    options = vision.GestureRecognizerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.LIVE_STREAM,
        result_callback=result_callback,
        num_hands=2,
        min_hand_detection_confidence=0.6,
        min_hand_presence_confidence=0.6
    )
    
    recognizer = vision.GestureRecognizer.create_from_options(options)
    
    # 4. CVZONE STATE VARIABLES
    pyautogui.PAUSE = 0
    pyautogui.FAILSAFE = False
    prev_x, prev_y = 0, 0
    curr_x, curr_y = 0, 0
    paused = False
    dragging = False
    
    # INNOVATION: Cache for detection optimization
    detection_cache = {"last_hand_count": 0, "cache_time": 0}
    
    print("✅ OPTIMIZED HYBRID VISION ENGINE: ONLINE\n")
    
    try:
        while vision_state.running:
            success, frame = cap.read()
            if not success:
                print("⚠️ Camera Frame Dropped")
                continue
            
            frame = cv2.flip(frame, 1)
            
            # INNOVATION: Apply CV enhancements
            enhanced_frame = enhance_frame(frame)
            
            # --- HAND DETECTION (CVZONE) ---
            hands, display_frame = detector_cvzone.findHands(enhanced_frame, flipType=False, draw=True)
            
            hand_count = len(hands) if hands else 0
            
            # --- MODE SWITCHING ---
            if hand_count == 2:
                vision_state.mode = "MEDIAPIPE"
            else:
                vision_state.mode = "CVZONE"
            
            # --- CVZONE MODE (1 HAND GESTURES) ---
            if vision_state.mode == "CVZONE" and hand_count == 1:
                hand = hands[0]
                fingers = detector_cvzone.fingersUp(hand)
                lmList = hand['lmList']
                x1, y1 = lmList[8][0], lmList[8][1]  # Index
                x2, y2 = lmList[12][0], lmList[12][1]  # Middle
                x3, y3 = lmList[4][0], lmList[4][1]   # Thumb
                
                # STATUS INDICATOR
                cv2.putText(display_frame, "MODE: CVZONE (OPTIMIZED)", (10, 30), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 0), 2)
                
                # INNOVATION: Apply Kalman Filter to index finger position
                x1_filtered, y1_filtered = vision_state.kalman.update(x1, y1)
                x1, y1 = int(x1_filtered), int(y1_filtered)
                
                if not paused:
                    # MOUSE MOVE (Index Up)
                    if fingers[1] == 1 and fingers[2] == 0:
                        x_sc = np.interp(x1, (FRAME_REDUCTION, CAM_W-FRAME_REDUCTION), (0, SCREEN_W))
                        y_sc = np.interp(y1, (FRAME_REDUCTION, CAM_H-FRAME_REDUCTION), (0, SCREEN_H))
                        curr_x = prev_x + (x_sc - prev_x) / SMOOTHING
                        curr_y = prev_y + (y_sc - prev_y) / SMOOTHING
                        pyautogui.moveTo(curr_x, curr_y)
                        prev_x, prev_y = curr_x, curr_y
                        cv2.circle(display_frame, (x1, y1), 10, (255, 0, 255), cv2.FILLED)
                    
                    # LEFT CLICK (Index + Thumb) with temporal validation
                    dist_l, _, _ = detector_cvzone.findDistance((x1, y1), (x3, y3), display_frame)
                    gesture = "Click" if dist_l < 30 and fingers[1] == 1 else "None"
                    validated_gesture = vision_state.gesture_validator.validate(gesture)
                    
                    if validated_gesture == "Click":
                        pyautogui.click()
                        cv2.circle(display_frame, (x1, y1), 15, (0, 255, 0), cv2.FILLED)
                        time.sleep(0.2)
                    
                    # RIGHT CLICK (Middle + Thumb)
                    dist_r, _, _ = detector_cvzone.findDistance((x2, y2), (x3, y3), display_frame)
                    if dist_r < 40 and fingers[2] == 1:
                        pyautogui.rightClick()
                        cv2.circle(display_frame, (x2, y2), 15, (0, 255, 255), cv2.FILLED)
                        time.sleep(0.3)
                    
                    # SCROLL (Peace Sign)
                    if fingers[1] == 1 and fingers[2] == 1 and fingers[3] == 0:
                        dist_p, _, _ = detector_cvzone.findDistance((x1, y1), (x2, y2), display_frame)
                        if dist_p > 40:
                            if y1 < 300:
                                pyautogui.scroll(20)
                            elif y1 > 420:
                                pyautogui.scroll(-20)
                            cv2.putText(display_frame, "SCROLL", (x1, y1-20), cv2.FONT_HERSHEY_PLAIN, 2, (0, 255, 255), 2)
                    
                    # DRAG (Fist)
                    if fingers[1] == 0 and fingers[2] == 0 and fingers[3] == 0 and fingers[4] == 0:
                        if not dragging:
                            pyautogui.mouseDown()
                            dragging = True
                        pyautogui.moveTo(curr_x, curr_y)
                        cv2.circle(display_frame, (x1, y1), 15, (0, 0, 255), cv2.FILLED)
                    elif dragging:
                        pyautogui.mouseUp()
                        dragging = False
                    
                    # DESKTOP (Shaka)
                    if fingers[0] == 1 and fingers[4] == 1 and fingers[1] == 0:
                        if not hasattr(main, 'shaka_t'):
                            main.shaka_t = 0
                        if time.time() - main.shaka_t > 2.0:
                            pyautogui.hotkey('win', 'd')
                            main.shaka_t = time.time()
                            cv2.putText(display_frame, "DESKTOP", (x1, y1), cv2.FONT_HERSHEY_PLAIN, 2, (255, 255, 0), 2)
                
                # LOCK TOGGLE (Spider-Man)
                if fingers[1] == 1 and fingers[4] == 1 and fingers[2] == 0:
                    if not hasattr(main, 'lock_t'):
                        main.lock_t = 0
                    if main.lock_t == 0:
                        main.lock_t = time.time()
                    if time.time() - main.lock_t > 1.5:
                        paused = not paused
                        main.lock_t = 0
                        print(f"SYSTEM: {'LOCKED' if paused else 'UNLOCKED'}")
                else:
                    main.lock_t = 0
                
                if paused:
                    cv2.putText(display_frame, "LOCKED", (10, 70), cv2.FONT_HERSHEY_PLAIN, 3, (0, 0, 255), 3)
            
            # --- MEDIAPIPE MODE (2 HANDS) ---
            elif vision_state.mode == "MEDIAPIPE" and hand_count == 2:
                cv2.putText(display_frame, "MODE: MEDIAPIPE (2 HANDS)", (10, 30), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 255), 2)
                
                # Send frame to MediaPipe
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=enhanced_frame)
                current_timestamp = int(time.time() * 1000)
                recognizer.recognize_async(mp_image, current_timestamp)
                
                # Process MediaPipe results
                with vision_state.lock:
                    result = vision_state.latest_result
                
                if result and result.gestures and len(result.gestures) > 0:
                    for i, gesture_list in enumerate(result.gestures):
                        if gesture_list:
                            gesture_name = gesture_list[0].category_name
                            score = gesture_list[0].score
                            cv2.putText(display_frame, f"Hand {i+1}: {gesture_name} ({score:.2f})", 
                                      (10, 70 + i*40), cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 0, 255), 2)
                
                # Send UDP data
                json_payload = {"mode": "MEDIAPIPE", "hand_count": hand_count}
                try:
                    msg = json.dumps(json_payload).encode('utf-8')
                    sock.sendto(msg, (UDP_IP, UDP_PORT_DATA))
                except:
                    pass
            
            # NO HANDS
            else:
                cv2.putText(display_frame, "MODE: STANDBY", (10, 30), cv2.FONT_HERSHEY_PLAIN, 2, (128, 128, 128), 2)
                # Reset Kalman filter when no hands
                vision_state.kalman.initialized = False
            
            # --- SEND VIDEO ---
            try:
                small_frame = cv2.resize(display_frame, (640, 360))
                _, buffer = cv2.imencode('.jpg', small_frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
                sock.sendto(buffer.tobytes(), (UDP_IP, UDP_PORT_VIDEO))
            except:
                pass
            
            # --- DISPLAY ---
            cv2.imshow("CÓDICE OPTIMIZED VISION", display_frame)
            
            if cv2.waitKey(1) & 0xFF == 27:
                vision_state.running = False
                break
                
    except KeyboardInterrupt:
        pass
    finally:
        vision_state.running = False
        cap.release()
        cv2.destroyAllWindows()
        print("🛑 OPTIMIZED VISION ENGINE STOPPED")

if __name__ == "__main__":
    main()
