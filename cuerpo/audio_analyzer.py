import os
import numpy as np
from pydub import AudioSegment
from pydub.utils import make_chunks

# Ensure ffmpeg is available for pydub
try:
    from static_ffmpeg import add_paths
    add_paths()
except ImportError:
    pass



class AudioAnalyzer:
    """Analyzes audio amplitude in real-time for lip-sync."""
    
    def __init__(self, chunk_duration_ms=50):
        """
        Args:
            chunk_duration_ms: How often to update mouth (50ms = 20 FPS)
        """
        self.chunk_duration = chunk_duration_ms
    
    def analyze_file(self, mp3_path):
        """
        Analyze an MP3 file and return RMS levels for each chunk.
        If analysis fails (missing ffmpeg, etc.), returns a fallback timeline.
        """
        if not os.path.exists(mp3_path):
            return self._get_fallback_timeline(2000) # Default 2s fallback
        
        try:
            # Load audio
            audio = AudioSegment.from_mp3(mp3_path)
            duration_ms = len(audio)
            
            # Split into chunks
            chunks = make_chunks(audio, self.chunk_duration)
            
            rms_timeline = []
            current_time = 0
            
            for chunk in chunks:
                # Calculate RMS
                rms = chunk.rms
                # Normalize 0-10
                normalized = int(min(max((rms - 500) / 450, 0), 10))
                rms_timeline.append((current_time, normalized))
                current_time += self.chunk_duration
            
            return rms_timeline
            
        except Exception as e:
            print(f"⚠️ Audio Analysis Failed: {e}. Using fallback animation.")
            # Fallback based on file size if possible, or 3s default
            try:
                size_bytes = os.path.getsize(mp3_path)
                # Rough estimate: ~20kb per second for speech MP3
                estimated_ms = int((size_bytes / 20000) * 1000)
                return self._get_fallback_timeline(max(1000, estimated_ms))
            except:
                return self._get_fallback_timeline(3000)

    def _get_fallback_timeline(self, duration_ms):
        """Creates a pseudo-random lip-sync timeline for fallback."""
        import random
        timeline = []
        for t in range(0, duration_ms, self.chunk_duration):
            # Simulated speech: 
            # 70% chance of movement, 30% pause
            if random.random() > 0.3:
                rms = random.randint(2, 9)
            else:
                rms = 0
            timeline.append((t, rms))
        return timeline
    
    @staticmethod
    def get_mouth_state(rms_level):
        """
        Convert RMS level (0-10) to mouth sprite name.
        
        Returns:
            'neutral', 'talk_low', 'talk_mid', or 'talk_high'
        """
        if rms_level == 0:
            return 'neutral'
        elif rms_level <= 3:
            return 'talk_low'
        elif rms_level <= 7:
            return 'talk_mid'
        else:
            return 'talk_high'


# Example usage for testing
if __name__ == "__main__":
    analyzer = AudioAnalyzer()
    
    # Test with a sample file
    test_file = "voice_test.mp3"
    if os.path.exists(test_file):
        timeline = analyzer.analyze_file(test_file)
        print(f"Analyzed {len(timeline)} chunks:")
        for time_ms, rms in timeline[:10]:  # Show first 10
            mouth = AudioAnalyzer.get_mouth_state(rms)
            print(f"  {time_ms}ms: RMS={rms} → {mouth}")
