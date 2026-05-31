import os
import sys

# Add local FFmpeg to PATH
current_dir = os.path.dirname(os.path.abspath(__file__))
ffmpeg_bin = os.path.join(current_dir, "ffmpeg", "bin")
if os.path.exists(ffmpeg_bin):
    print(f"Adding FFmpeg to PATH: {ffmpeg_bin}")
    os.environ['PATH'] += os.pathsep + ffmpeg_bin
else:
    print("WARNING: Local FFmpeg bin not found. Hoping system FFmpeg works.")

# Force Audiocraft to use Torch backend (CPU compatible)
import audiocraft.modules.transformer
audiocraft.modules.transformer.set_efficient_attention_backend('torch')

try:
    import torch
    from audiocraft.models import MusicGen
    from audiocraft.data.audio import audio_write
except ImportError as e:
    import traceback
    traceback.print_exc()
    print(f"CRITICAL ERROR: Missing dependencies. {e}")
    sys.exit(1)
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"CRITICAL ERROR: Unexpected error. {e}")
    sys.exit(1)

def main():
    print("Initializing MusicGen...")
    # Using 'small' model (300M parameters) ~1-2GB VRAM/RAM
    model = MusicGen.get_pretrained('facebook/musicgen-small')
    
    print("Setting generation parameters...")
    model.set_generation_params(duration=5)  # 5 seconds test

    descriptions = ['lo-fi hip hop beat with jazz piano', 'rock heavy metal solo']
    
    print(f"Generating music for prompts: {descriptions}")
    wav = model.generate(descriptions)  # generates 2 samples.

    for idx, one_wav in enumerate(wav):
        # Will save as musicgen_out_0.wav, etc.
        path = audio_write(f'musicgen_out_{idx}', one_wav.cpu(), model.sample_rate, strategy="loudness", loudness_compressor=True)
        print(f"VICTORY! Saved generated audio to: {path}")

if __name__ == "__main__":
    main()
