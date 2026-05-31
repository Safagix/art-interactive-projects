import sys
import json
import threading
import time
from main_eira_lab import EiraDigitalLab

class TauriEiraAdapter(EiraDigitalLab):
    def __init__(self):
        super().__init__()
        self.last_status = None
        
    def draw_ui(self, img):
        # Instead of drawing on OpenCV, we send JSON to stdout
        status_data = {
            "status": self.eira_status,
            "listening": self.listening_mode,
            "paused": self.paused,
            "mic_muted": self.mic_muted,
            "audio_level": self.get_audio_level()
        }
        
        # Only print if status changed or every 500ms to avoid flooding
        if status_data != self.last_status:
            print(json.dumps({"type": "status", "data": status_data}), flush=True)
            self.last_status = status_data

    def run_sidecar(self):
        # Start command listener in a thread
        threading.Thread(target=self.stdin_listener, daemon=True).start()
        # Run the vision loop (which calls draw_ui)
        self.run()

    def stdin_listener(self):
        for line in sys.stdin:
            try:
                cmd = json.loads(line)
                if cmd["action"] == "trigger_voice":
                    self.listening_mode = True
                elif cmd["action"] == "toggle_mute":
                    self.mic_muted = not self.mic_muted
                elif cmd["action"] == "toggle_lock":
                    self.paused = not self.paused
                elif cmd["action"] == "shutdown":
                    self.running = False
                    sys.exit(0)
            except Exception as e:
                print(json.dumps({"type": "error", "message": str(e)}), flush=True)

if __name__ == "__main__":
    # We might not need the Qt app if we use Tauri for the UI
    # but eira_avatar depends on it. For now, let's keep it minimal.
    adapter = TauriEiraAdapter()
    adapter.run_sidecar()
