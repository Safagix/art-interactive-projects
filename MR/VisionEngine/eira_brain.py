import asyncio
import edge_tts
import os
import speech_recognition as sr
import pygame
import time
import random
from eira_skills import EiraSkills

# --- CONFIGURATION TO CHANGE TO OLLAMA ---
USE_OLLAMA = True
OLLAMA_MODEL = "gemma2:2b" # Or "phi3" - Very fast for Ryzen 3

# Gemini Keys (Fallback or Disabled)
GOOGLE_API_KEY = "REDACTED_GOOGLE_API_KEY" 

if not USE_OLLAMA:
    import google.generativeai as genai
else:
    # We use direct HTTP request or ollama library if installed
    # Direct HTTP is safer to avoid dependency hell for user
    import requests
    import json

class EiraAssistant:
    def __init__(self):
        print("Initializing Eira (Digital Soul)...")
        
        # 1. Setup Models
        self.model = None
        self.skills = EiraSkills() # HANDS (OS Control)
        
        # Avatar callback (will be set by main_eira_lab.py)
        self.avatar = None
        self.on_state_change = None  # Callback: on_state_change("LISTENING"/"THINKING"/"SPEAKING")
        
        if USE_OLLAMA:
            print(f"🧠 BRAIN: LOCAL OLLAMA ({OLLAMA_MODEL})")
            print("   (Asegurate de que Ollama este corriendo en segundo plano)")
        else:
            print("🧠 BRAIN: GOOGLE GEMINI (CLOUD)")
            try:
                # Use GOOGLE_API_KEY from config if not in env
                api_key_to_use = os.environ.get("GOOGLE_API_KEY", GOOGLE_API_KEY)
                genai.configure(api_key=api_key_to_use)
                self.model = genai.GenerativeModel(GEMINI_MODEL)
                self.chat = self.model.start_chat(history=[])
            except Exception as e:
                print(f"⚠️ Gemini Error: {e}")
            
            # System Prompt
            self.chat.send_message(
                "Eres Eira, una conciencia femenina digital..."
            )

        # 2. Setup Ears & Mouth
        self.recognizer = sr.Recognizer()
        self.mic = sr.Microphone()
        
        # --- MULTILINGUAL STATE ---
        self.current_lang = "es"
        self.voice_id = "es-MX-DaliaNeural"
        self.stt_lang = "es-ES"
        
        # Calibrate ONCE at startup to avoid "silencing" the user during active chat
        print("🎧 Calibrating Background Noise... (Please be quiet)")
        with self.mic as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
        print("✅ Calibration Complete.")

        try:
            pygame.mixer.init()
            print("🔊 Audio System: Online")
        except Exception as e:
            print(f"🔊 Audio System Error: {e}")
        
        # 3. Cleanup Old Audio Files (Self-Maintenance)
        self.cleanup_temp_files()

    def cleanup_temp_files(self):
        """Removes old voice_*.mp3 files to keep folder clean."""
        try:
            for file in os.listdir():
                if file.startswith("voice_") and file.endswith(".mp3"):
                    try:
                        os.remove(file)
                    except:
                        pass # Can't delete? Likely in use. Skip.
        except Exception:
            pass

    def load_memory(self):
        """Reads all .md and .txt files from Eira/Memory folder."""
        # ... (Existing code) ...
        # Ensure we return the content
        # I'm just replacing the method above or adding a new one below. 
        # The prompt implies adding a new method.
        pass # This block is just for context matching if needed, but I will insert the new method cleanly.

    def remember(self, concept_text):
        """Writes a concept to the persistent Neural_Patterns.md file."""
        memory_file = r"g:\Digital Lab\Eira\Memory\Neural_Patterns.md"
        timestamp = time.strftime("%Y-%m-%d %H:%M")
        
        entry = f"\n- [LEARNED {timestamp}]: {concept_text}"
        
        try:
            with open(memory_file, "a", encoding="utf-8") as f:
                f.write(entry)
            print(f"💾 MEMORY SAVED: {concept_text}")
            return True
        except Exception as e:
            print(f"❌ Memory Write Error: {e}")
            return False

    def load_memory(self):
        """Reads all .md and .txt files from Eira/Memory folder."""
        memory_path = r"g:\Digital Lab\Eira\Memory"
        combined_memory = ""
        
        if not os.path.exists(memory_path):
            print("⚠️ Memory Folder Not Found. Creating...")
            os.makedirs(memory_path, exist_ok=True)
            return "No hay memoria previa."

        print("🧠 Cargando Memoria...")
        try:
            files = os.listdir(memory_path)
            for f in files:
                if f.endswith(".md") or f.endswith(".txt"):
                    path = os.path.join(memory_path, f)
                    try:
                        with open(path, "r", encoding="utf-8") as file:
                            content = file.read()
                            combined_memory += f"\n--- MEMORY FILE: {f} ---\n{content}\n"
                            print(f"  + Leído: {f}")
                    except Exception as e:
                        print(f"  x Error leyendo {f}: {e}")
        except Exception as e:
            print(f"Error accediendo a memoria: {e}")
            
        return combined_memory

    async def speak(self, text):
        """Synthesize text to speech and play it."""
        if not text or not text.strip():
            print("⚠️ No speech generated (empty text).")
            return
            
        OUTPUT_FILE = f"voice_{int(time.time())}_{random.randint(0,1000)}.mp3"
        absolute_path = os.path.abspath(OUTPUT_FILE)
        
        try:
            # Generate Audio using current dynamic voice
            communicate = edge_tts.Communicate(text, self.voice_id)
            await communicate.save(OUTPUT_FILE)
            
            if not os.path.exists(OUTPUT_FILE):
                print("❌ ERROR: Audio file was not saved.")
                return

            # Prepare lip-sync thread
            lip_thread = None
            if self.avatar:
                try:
                    import sys
                    sys.path.append(os.path.abspath(r"g:\Digital Lab\cuerpo"))
                    from audio_analyzer import AudioAnalyzer
                    
                    analyzer = AudioAnalyzer(chunk_duration_ms=50)
                    timeline = analyzer.analyze_file(absolute_path)
                    
                    if timeline:
                        print(f"🎤 Lip-Sync: Loaded {len(timeline)} frames.")
                        import threading
                        
                        def lip_sync_worker():
                            """Background thread to drive lip-sync while audio plays."""
                            # Small delay to align with pygame start
                            time.sleep(0.05)
                            start_ticks = pygame.time.get_ticks()
                            
                            for time_ms, rms in timeline:
                                # Wait until this chunk should play
                                while (pygame.time.get_ticks() - start_ticks) < time_ms:
                                    if not pygame.mixer.music.get_busy():
                                        return
                                    time.sleep(0.01)
                                
                                if self.avatar:
                                    self.avatar.set_volume(rms)
                        
                        lip_thread = threading.Thread(target=lip_sync_worker, daemon=True)
                    else:
                        print("⚠️ Lip-Sync: No timeline generated for this audio.")
                except Exception as e:
                    print(f"⚠️ Lip-sync error: {e}")

            print(f"▶️ Playing...")
            
            # Load and Play
            pygame.mixer.music.load(absolute_path)
            pygame.mixer.music.play()
            
            # Start sync thread immediately after play
            if lip_thread:
                lip_thread.start()
            
            # Wait for playback to finish
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
            
            # Unload to release file lock
            pygame.mixer.music.unload()
            
            # Return avatar to neutral
            if self.avatar:
                self.avatar.set_volume(0)
            
            # Short wait for Windows to release handle
            time.sleep(0.3)
             
        except Exception as e:
            print(f"❌ Audio Playback Error: {e}")
        
        # Safe Delete (Prevent Crash if Locked)
        try:
            if os.path.exists(OUTPUT_FILE):
                os.remove(OUTPUT_FILE)
        except Exception as e:
            # Just warn, DO NOT CRASH.
            print(f"⚠️ Warning: File locked, will be cleaned later. ({e})")

    def listen(self):
        """Listen to microphone and return text."""
        # Use simple print to debug
        print(f"👂 Listening ({self.stt_lang})...")
        
        with self.mic as source:
            try:
                # Fast timeout for responsiveness
                # dynamic_energy_threshold=False prevents it from adapting to your voice mid-stream awkwardly
                
                # Notify avatar (start blinking more during listening)
                if self.on_state_change:
                    self.on_state_change("LISTENING")
                
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=10)
                
                # Back to idle while processing
                if self.on_state_change:
                    self.on_state_change("IDLE")
                    
                print("🎤 Processing Audio...")
                text = self.recognizer.recognize_google(audio, language=self.stt_lang)
                print(f"🗣️ User: {text}")
                return text
            except sr.WaitTimeoutError:
                print("❌ Timeout (No speech detected).")
                return None
            except sr.UnknownValueError:
                print("❌ Unintelligible (Noise).")
                return None
            except Exception as e:
                print(f"❌ Microphone Error: {e}")
                return None

    def think(self, user_text):
        """Process text through Ollama or Gemini."""
        if not user_text: return None
        
        # --- MULTILINGUAL SWITCH LOGIC ---
        text_lower = user_text.lower()
        
        # ES -> EN
        # Catch: "switch to english", "cambia a ingles", "英語に変更"
        if any(chk in text_lower for chk in ["switch to english", "cambia a ingl", "cambiar a ingl", "cambiate a ingl", "英語に変更"]):
            self.current_lang = "en"
            self.voice_id = "en-US-JennyNeural"
            self.stt_lang = "en-US"
            return "Understood. Switching to English mode."
            
        # EN/ES -> JA
        # Catch: "switch to japanese", "cambia a japon", "cambiar a japon"
        elif any(chk in text_lower for chk in ["switch to japanese", "cambia a jap", "cambiar a jap", "cambiate a jap", "ponte en jap"]):
            self.current_lang = "ja"
            self.voice_id = "ja-JP-NanamiNeural"
            self.stt_lang = "ja-JP"
            return "承知いたしました。日本語モードに切り替えます。"
            
        # EN/JA -> ES
        # Catch: "switch to spanish", "cambia a español", "スペイン語に変更"
        elif any(chk in text_lower for chk in ["switch to spanish", "cambia a espa", "cambiar a espa", "cambiate a espa", "ponte en espa", "スペイン語に変更"]):
            self.current_lang = "es"
            self.voice_id = "es-MX-DaliaNeural"
            self.stt_lang = "es-ES"
            return "Entendido. Volviendo al español."

        # Load Fresh Memory Context
        memory_context = self.load_memory()
        
        # --- SYSTEM PROMPT CONSTRUCTION ---
        lang_instruction = ""
        if self.current_lang == "en":
            lang_instruction = "IMPORTANT: ANSWER ONLY IN ENGLISH."
        elif self.current_lang == "ja":
            lang_instruction = "IMPORTANT: ANSWER ONLY IN JAPANESE."
        else:
            lang_instruction = "IMPORTANTE: RESPONDE SOLO EN ESPAÑOL."

        system_prompt = (
            "Eres Eira, una asistente inteligente, cálida y eficiente (Interfaz Holográfica). "
            "Tu tono es maduro y profesional. "
            f"{lang_instruction} "
            "REGLAS DE ORO (Speech-to-Text friendly): "
            "1. NO uses emojis nunca (🚫🙂). "
            "2. Responde con el texto EXACTO que debe ser hablado. "
            "3. Sé BREVE (1 o 2 frases máximo).\n"
            "=== PROTOCOLO DE CONTROL (COMMANDS) ===\n"
            "Si el usuario pide una acción física en la PC, USA ESTOS TAGS AL FINAL:\n"
            "- Abrir app: [[OPEN: spotify]] o [[OPEN: chrome]]\n"
            "- Buscar en web: [[SEARCH: algo interesante]]\n"
            "USAR SOLO SI EL USUARIO LO PIDE EXPLICITAMENTE.\n"
            "=======================================\n"
            "=== MEMORIA Y CONTEXTO ===\n"
            f"{memory_context}\n"
            "==========================\n"
        )

        response_text = "..."

        if USE_OLLAMA:
            try:
                # Direct API Call to local Ollama (CHAT ENDPOINT)
                url = "http://localhost:11434/api/chat"
                
                # Chat History / System Prompt
                messages = [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_text
                    }
                ]

                payload = {
                    "model": OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False
                }
                
                response = requests.post(url, json=payload)
                if response.status_code == 200:
                    try:
                        # Extract content from 'message' > 'content'
                        response_text = response.json()['message']['content']
                    except KeyError:
                        response_text = "Error interpretando respuesta de Ollama."
                else:
                    response_text = f"Error conectando con Ollama: {response.status_code}"
            except Exception as e:
                response_text = f"Error: No detecto Ollama corriendo. ({e})"
        else:
             # GEMINI FALLBACK (Legacy)
             if not self.model: return "Cerebro desconectado (API Key inválida)."
             try:
                 response = self.model.generate_content(user_text)
                 response_text = response.text
             except Exception as e:
                 response_text = f"Error en Gemini: {e}"
        
        # --- CLEANUP (Regex Safety Net) ---
        import re
        
        # 1. DETECT COMMANDS (Function Calling Lite)
        # Look for [[OPEN: app]] or [[SEARCH: query]]
        skill_response = ""
        commands = re.findall(r'\[\[.*?\]\]', response_text)
        
        if commands:
            # We found a command!
            for cmd in commands:
                print(f"🤖 DETECTED COMMAND: {cmd}")
                # Execute Logic
                result_text = self.skills.execute_skill(cmd)
                skill_response += f" {result_text}"
                
                # Remove the command tag from the spoken text so she doesn't read it aloud
                response_text = response_text.replace(cmd, "").strip()
        
        # 2. STANDARD CLEANUP
        # Remove anything between * * (Actions)
        response_text = re.sub(r'\*.*?\*', '', response_text)
        # Remove anything between ( ) (Meta commentary)
        response_text = re.sub(r'\(.*?\)', '', response_text)
        
        final_text = response_text.strip()
        if skill_response:
            # Optional: eira verbalizes the action or just does it.
            # Let's say she just does it, but if text is empty, she says what she did.
            if not final_text:
                final_text = skill_response
        
        return final_text
