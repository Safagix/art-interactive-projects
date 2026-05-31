"""
Eira Avatar System
PyQt6-based animated avatar with expression switching, random blinking, and lip-sync.
"""

import sys
import os
import random
from PyQt6.QtWidgets import QApplication, QMainWindow, QLabel
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject
from PyQt6.QtGui import QPixmap
import threading

# --- CONFIGURATION ---
ASSETS_DIR = r"g:\Digital Lab\cuerpo\assets\avatar"
SCALE_FACTOR = 0.6  # Adjust to resize the avatar (1.0 = original size)

# Expression filenames
EXPRESSIONS = {
    "neutral": "neutral.png",
    "smile": "smile.png",
    "talk_low": "talk_low.png",
    "talk_mid": "talk_mid.png",
    "talk_high": "talk_high.png",
    "blink": "blink.png",
    "thinking": "thinking.png",
    "warm": "warm.png",
}


class EiraSignals(QObject):
    """Thread-safe signals for avatar control."""
    change_expression = pyqtSignal(str)  # Expression name
    set_volume = pyqtSignal(int)  # RMS volume 0-10


class EiraAvatar(QMainWindow):
    """Main avatar window with expression switching and animations."""
    
    def __init__(self):
        super().__init__()
        
        # Access the existing QApplication
        self._qt_app = QApplication.instance()
        if self._qt_app is None:
            # Fallback for standalone mode
            self._qt_app = QApplication(sys.argv)
        
        # 1. Window Setup (Transparent, Frameless, TopMost)
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool  # Hide from taskbar
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        
        # 2. Geometry - Will be positioned after loading assets
        self.screen_geo = self._qt_app.primaryScreen().availableGeometry()
        
        # 3. Image Label
        self.image_label = QLabel(self)
        self.image_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # 4. Load all expression pixmaps
        self.pixmaps = {}
        self.load_assets()
        
        # 5. State tracking
        self.current_expression = "neutral"
        self.pre_blink_expression = "neutral"
        self.is_blinking = False
        self.is_speaking = False
        
        # 6. Blink Timer (Random 2-6 seconds)
        self.blink_timer = QTimer(self)
        self.blink_timer.timeout.connect(self._do_blink)
        self._schedule_next_blink()
        
        # 7. Blink Duration Timer (150ms)
        self.blink_duration_timer = QTimer(self)
        self.blink_duration_timer.setSingleShot(True)
        self.blink_duration_timer.timeout.connect(self._end_blink)
        
        # 8. Signals for thread-safe updates
        self.signals = EiraSignals()
        self.signals.change_expression.connect(self._set_expression)
        self.signals.set_volume.connect(self._handle_volume)
        
        # 9. Set initial expression
        self._set_expression("neutral")
        
        # 10. Dragging support
        self.drag_start_position = None
        
        # 10. Position in top-right corner
        margin = 10
        self.move(self.screen_geo.width() - self.width() - margin, margin)
        
        self.show()
        print("🎭 Eira Avatar: Online")
    
    def load_assets(self):
        """Load all expression images from assets folder."""
        for name, filename in EXPRESSIONS.items():
            path = os.path.join(ASSETS_DIR, filename)
            if os.path.exists(path):
                pix = QPixmap(path)
                if SCALE_FACTOR != 1.0:
                    pix = pix.scaled(
                        int(pix.width() * SCALE_FACTOR),
                        int(pix.height() * SCALE_FACTOR),
                        Qt.AspectRatioMode.KeepAspectRatio,
                        Qt.TransformationMode.SmoothTransformation
                    )
                self.pixmaps[name] = pix
                print(f"  ✅ Loaded: {filename}")
            else:
                print(f"  ⚠️ Missing: {filename}")
                self.pixmaps[name] = QPixmap()  # Empty fallback
        
        # Resize window to fit the first valid pixmap
        if "neutral" in self.pixmaps and not self.pixmaps["neutral"].isNull():
            self.resize(self.pixmaps["neutral"].size())
            self.image_label.resize(self.pixmaps["neutral"].size())
    
    # --- EXPRESSION CONTROL ---
    
    def _set_expression(self, expression: str):
        """Internal: Set the current expression (thread-safe via signal)."""
        if expression in self.pixmaps and not self.is_blinking:
            self.current_expression = expression
            self.image_label.setPixmap(self.pixmaps[expression])
    
    def set_expression(self, expression: str):
        """Public API: Change expression from any thread."""
        self.signals.change_expression.emit(expression)
    
    # --- BLINKING SYSTEM ---
    
    def _schedule_next_blink(self):
        """Schedule the next blink with random interval (2-6 seconds)."""
        interval = random.randint(2000, 6000)
        self.blink_timer.start(interval)
    
    def _do_blink(self):
        """Perform a blink animation."""
        if self.is_blinking:
            return
        
        self.is_blinking = True
        self.pre_blink_expression = self.current_expression
        
        # Change to blink image
        if "blink" in self.pixmaps:
            self.image_label.setPixmap(self.pixmaps["blink"])
        
        # Start duration timer (150ms)
        self.blink_duration_timer.start(150)
    
    def _end_blink(self):
        """End the blink and restore the latest expression."""
        self.is_blinking = False
        
        # Restore the expression that was set (either manual or lip-sync) during the blink
        if self.pre_blink_expression in self.pixmaps:
            self.image_label.setPixmap(self.pixmaps[self.pre_blink_expression])
            self.current_expression = self.pre_blink_expression
        else:
            self._set_expression("neutral")
        
        # Schedule next blink
        self._schedule_next_blink()
    
    # --- LIP-SYNC SYSTEM ---
    
    def _handle_volume(self, rms_level: int):
        """Map RMS volume (0-10) to talk expressions."""
        # Determine target expression based on audio intensity
        if rms_level == 0:
            target = "neutral"
            self.is_speaking = False
        elif rms_level <= 3:
            target = "talk_low"
            self.is_speaking = True
        elif rms_level <= 7:
            target = "talk_mid"
            self.is_speaking = True
        else:
            target = "talk_high"
            self.is_speaking = True
        
        # Always update the tracking state so that blinks know what to return to
        if target in self.pixmaps:
            self.current_expression = target
            self.pre_blink_expression = target
            
            # Only update the GUI if we are not currently showing the blink frame
            if not self.is_blinking:
                self.image_label.setPixmap(self.pixmaps[target])
    
    def set_volume(self, rms_level: int):
        """Public API: Update lip-sync from any thread (0-10 scale)."""
        # Clamp to valid range
        rms_level = max(0, min(10, rms_level))
        self.signals.set_volume.emit(rms_level)
    
    def set_speaking(self, is_speaking: bool):
        """Simple toggle for speaking (uses talk_mid when True)."""
        if is_speaking:
            self.set_volume(5)  # Mid-level talk
        else:
            self.set_volume(0)  # Return to neutral
    
    # --- WINDOW DRAGGING ---
    
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_start_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()
    
    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton and self.drag_start_position:
            self.move(event.globalPosition().toPoint() - self.drag_start_position)
            event.accept()
    
    def mouseReleaseEvent(self, event):
        self.drag_start_position = None
    
    def keyPressEvent(self, event):
        """Handle keyboard shortcuts."""
        if event.key() == Qt.Key.Key_Escape or event.key() == Qt.Key.Key_Q:
            print("🔴 Closing Eira Avatar...")
            self.close()
            QApplication.quit()
        event.accept()


# --- STANDALONE TEST MODE ---
def main():
    """Test the avatar with simulated lip-sync."""
    app = QApplication(sys.argv)
    avatar = EiraAvatar()
    
    # Simulate talking with random volume levels
    talk_timer = QTimer()
    is_talking = False
    
    def simulate_talk():
        nonlocal is_talking
        if is_talking:
            # Random volume while "talking"
            volume = random.randint(1, 10)
            avatar.set_volume(volume)
        else:
            avatar.set_volume(0)
    
    def toggle_talk():
        nonlocal is_talking
        is_talking = not is_talking
        print(f"🎤 Speaking: {is_talking}")
    
    # Fast updates for lip-sync simulation
    talk_timer.timeout.connect(simulate_talk)
    talk_timer.start(100)  # Update every 100ms
    
    # Toggle talking every 3 seconds
    toggle_timer = QTimer()
    toggle_timer.timeout.connect(toggle_talk)
    toggle_timer.start(3000)
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
