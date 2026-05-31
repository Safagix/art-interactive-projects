# Innovation: Roadmap de Mejoras para Códice y Eira (FMHY Enhanced)

**Fecha:** Diciembre 2024  
**Objetivo:** Investigación de herramientas **open-source, gratuitas y estables** para optimizar Códice (Vision Engine) y Eira (AI Assistant).

**Hardware Base:** AMD Ryzen 3, Webcam, Micrófono  
**Restricciones:** Solo software libre, sin hardware adicional, sin costos, PC Desktop únicamente  
**Fuente Adicional:** [FMHY Wiki](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/index/) - Repositorio comunitario de recursos gratuitos

---

## 1. 🔬 Vision Engine (Códice) - Mejoras Open-Source

### 1.1 Librerías de Hand Tracking Gratuitas

#### **GRLib (Hand Gesture Recognition Library)**

- **Estado:** ✅ Open-source, MIT License
- **Costo:** $0 (Gratis)
- **Ventaja:** Supera a MediaPipe en datasets del mundo real
- **Características:**
  - Gestos estáticos y dinámicos
  - Extracción de trayectorias (dynamic gestures)
  - Compatible con MediaPipe Hands como backend
  - Entrenamiento custom con tus propios gestos
- **Requisitos:** Python 3.8+, funciona en CPU (Ryzen 3 compatible)
- **Integración:** Drop-in replacement para MediaPipe Tasks
- **Repositorio:** <https://github.com/ozgraslan/GRLib>
- **Prioridad:** ⭐⭐⭐ ALTA (próxima actualización recomendada)

### 1.2 Optimizaciones para el Sistema Actual (Sin Nuevas Librerías)

#### **Hybrid Tracking Enhancements**

- ✅ **Kalman Filter** (IMPLEMENTADO) - Suavizado de trayectorias
- ✅ **Validación Temporal** (IMPLEMENTADO) - 300ms persistence
- ✅ **Histogram Equalization** (IMPLEMENTADO) - Mejor rendimiento en baja luz
- **Contour Detection** - Validar formas de mano (futuro)
- **Background Subtraction** - Mejorar detección en entornos ruidosos (futuro)

---

## 2. 🤖 AI Assistant (Eira) - Mejoras Open-Source

### 2.1 Speech Recognition Local (Zero-Cost)

#### **Whisper v3 (OpenAI) - Modelo Local**

- **Estado:** ✅ Open-source, MIT License
- **Costo:** $0 (Gratis, 100% offline)
- **Ventaja:** Mejor precisión multilingüe que sistema actual
- **Características:**
  - 100+ idiomas (Español nativo incluido)
  - Detección automática de idioma
  - 100% offline (privacidad total)
  - Funciona en CPU (Ryzen 3 suficiente)
- **Modelos recomendados:**
  - `whisper-tiny` (39MB) - Rápido, ~10x velocidad real (recomendado Ryzen 3)
  - `whisper-base` (74MB) - Balance velocidad/precisión
  - `whisper-small` (244MB) - Mayor precisión
- **Instalación:** `pip install openai-whisper`
- **Integración:** Reemplazar actual speech-to-text en `eira_brain.py`
- **Prioridad:** ⭐⭐⭐ ALTA

### 2.2 Text-to-Speech Avanzado (FMHY Curado)

#### **Piper TTS (Recomendado para Ryzen 3)**

- **Estado:** ✅ Open-source, MIT License
- **Costo:** $0 (Gratis)
- **Ventaja:** Ultra-rápido en CPU, latencia <100ms
- **Repositorio:** <https://github.com/rhasspy/piper>
- **Prioridad:** ⭐⭐⭐ ALTA

#### **Nuevas Opciones (FMHY Discovery)**

**Tortoise TTS**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis, sin sign-up)
- **Ventaja:** Alta calidad de voz, entrenamiento custom
- **Desventaja:** Más lento que Piper (3-5s por frase)
- **Repositorio:** <https://github.com/neonbjb/tortoise-tts>
- **Prioridad:** ⭐⭐ MEDIA (calidad > velocidad)

**Bark (Suno AI)**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis)
- **Ventaja:** Genera risas, suspiros, efectos sonoros
- **Características:**
  - Multilingüe (español incluido)
  - Puede clonar voces
  - Funciona en CPU (lento) o GPU (rápido)
- **Repositorio:** <https://github.com/suno-ai/bark>
- **Colab:** <https://colab.research.google.com/drive/1eJfA2XUa-mXwdMy7DoYKVYHI1iTd9Vkt>
- **Prioridad:** ⭐⭐ MEDIA (emociones vocales)

**GPT-SoVITS**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis)
- **Ventaja:** Clonación de voz con pocos samples (~5s audio)
- **Repositorio:** <https://github.com/RVC-Boss/GPT-SoVITS>
- **Uso:** Crear voz custom de Eira clonando tu propia voz
- **Prioridad:** ⭐⭐⭐ ALTA (personalización extrema)

**Kokoro TTS (Hexgrad)**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis)
- **Ventaja:** Modelo ultra-ligero (82M parámetros)
- **Repositorio:** <https://github.com/hexgrad/kokoro>
- **HuggingFace:** <https://huggingface.co/hexgrad/Kokoro-82M>
- **Prioridad:** ⭐ BAJA (experimental)

### 2.3 Voice Cloning & RVC (Real-Time Voice Conversion)

#### **Applio (FMHY Recomendado)**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis)
- **Ventaja:** Clonación de voz con UI amigable
- **Características:**
  - Interfaz gráfica completa
  - RVC (Retrieval-based Voice Conversion)
  - Entrenamiento de modelos custom
- **Repositorio:** <https://github.com/IAHispano/Applio>
- **Web:** <https://applio.org/>
- **Uso:** Crear voz de Eira única o convertir tu voz en tiempo real
- **Prioridad:** ⭐⭐⭐ ALTA (si deseas voz custom)

#### **RVC V2 (Retrieval-based Voice Conversion)**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis, local)
- **Ventaja:** Conversión de voz en tiempo real o batch
- **Repositorio:** <https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI>
- **Colab:** <https://colab.research.google.com/github/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/blob/main/Retrieval_based_Voice_Conversion_WebUI_v2.ipynb>
- **Prioridad:** ⭐⭐ MEDIA (avanzado)

### 2.4 LLM Local (Ollama) + Frontends Alternativos

#### **Modelos Optimizados para Ryzen 3**

(Sin cambios, ya documentado)

1. **qwen2.5:7b** - Prioridad ⭐⭐⭐
2. **gemma2:9b** - Prioridad ⭐⭐
3. **llama3.2:3b** - Prioridad ⭐

#### **Nuevos Frontends (FMHY Discovery)**

**Open WebUI**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis, self-hosted)
- **Ventaja:** Interfaz moderna estilo ChatGPT para Ollama local
- **Características:**
  - UI responsive, dark mode
  - Gestión de conversaciones
  - Compatible con Ollama out-of-the-box
- **Repositorio:** <https://github.com/open-webui/open-webui>
- **Web:** <https://openwebui.com/>
- **Instalación:** `docker run -d -p 3000:8080 ghcr.io/open-webui/open-webui:main`
- **Alternativa:** Python local `pip install open-webui`
- **Prioridad:** ⭐⭐ MEDIA (UI mejorada para Eira)

**Msty**

- **Estado:** ✅ Gratis
- **Costo:** $0 (Descarga y ejecuta modelos localmente)
- **Ventaja:** Desktop app con descarga de modelos integrada
- **Web:** <https://msty.app/>
- **Prioridad:** ⭐ BAJA (alternativa a Ollama)

**GPT4Free (g4f)**

- **Estado:** ✅ Open-source
- **Costo:** $0 (Gratis, bypass de APIs)
- **Ventaja:** Acceso gratis a GPT-4, Claude (via reverse engineering)
- **⚠️ Advertencia:** Inestable, puede dejar de funcionar
- **Repositorio:** <https://github.com/xtekky/gpt4free>
- **Prioridad:** ⭐ BAJA (no confiable, solo experimentación)

---

## 3. 🎮 Godot 4 (PC Desktop) - Optimizaciones

### 3.1 Performance Optimization (CPU-Focused)

(Sin cambios de la versión anterior)

---

## 4. 📡 Networking - Optimizaciones Simples

(Sin cambios de la versión anterior)

---

## 5. 🔮 Innovaciones Futuras (PC-Only, Open-Source)

### 5.1 Computer Vision Avanzado

(Sin cambios - YOLO v8, MediaPipe Holistic, Tesseract OCR)

### 5.2 Audio Processing Avanzado (FMHY Nuevo)

#### **Voice Removal / Isolation**

- **UVR (Ultimate Vocal Remover)**
  - Separa voz de música/ruido de fondo
  - Útil para limpiar audio de micrófonos con ruido
  - Repositorio: <https://github.com/Anjok07/ultimatevocalremovergui>
  - Prioridad: ⭐ BAJA (calidad de vida)

#### **Audio Enhancement**

- **Audiocraft (Meta)**
  - Generación de música/efectos de sonido
  - Puede crear sonidos ambientales para Eira
  - Repositorio: <https://github.com/facebookresearch/audiocraft>
  - Prioridad: ⭐ BAJA (experimental)

---

## 6. ✅ Roadmap Priorizado (Zero-Cost, PC-Only) - ACTUALIZADO

### **Crítico (1 mes)**

1. ⭐⭐⭐ **GPT-SoVITS** - Clonación de voz para Eira (personalización extrema)
   - Instalación: `git clone https://github.com/RVC-Boss/GPT-SoVITS`
   - Uso: Clonar voz con 5s de audio
   - Mejora: Voz única y natural para Eira

2. ⭐⭐⭐ **Whisper Tiny/Small** - Speech-to-text superior
   - Ya documentado
   - Mejora: +30% precisión en español

3. ⭐⭐⭐ **Ollama: qwen2.5:7b** - Upgrade LLM
   - Ya documentado
   - Mejora: Mejor español que llama2

### **Alta Prioridad (1-2 meses)**

1. ⭐⭐⭐ **Applio** - Voice cloning con UI
2. ⭐⭐ **Tortoise TTS** - Alta calidad de voz (si Piper no satisface)
3. ⭐⭐ **Open WebUI** - Interfaz moderna para Ollama
4. ⭐⭐ **YOLO v8** - Object detection (Eira describe entorno)

### **Media Prioridad (3-6 meses)**

1. ⭐⭐ **Bark TTS** - Emociones vocales (risas, suspiros)
2. ⭐⭐ **GRLib** - Gestos custom (si resolvemos numpy conflict)
3. ⭐⭐ **SpeechBrain** - Emotion detection
4. ⭐ **RVC V2** - Conversión de voz en tiempo real

### **Baja Prioridad (Exploración Futura)**

1. ⭐ **Tesseract OCR** - Screen reading
2. ⭐ **MediaPipe Holistic** - Full-body pose
3. ⭐ **GPT4Free** - Experimentación (inestable)
4. ⭐ **Audiocraft** - Generación de música/SFX

---

## 7. 📚 Recursos Open-Source (Verificados + FMHY)

**Vision & Hand Tracking:**

- [MediaPipe Solutions](https://developers.google.com/mediapipe/solutions/)
- [GRLib GitHub](https://github.com/ozgraslan/GRLib)
- [cvzone Documentation](https://github.com/cvzone/cvzone)

**Speech & Voice (AMPLIADO):**

- [Whisper GitHub](https://github.com/openai/whisper)
- [Piper TTS](https://github.com/rhasspy/piper)
- [Tortoise TTS](https://github.com/neonbjb/tortoise-tts)
- [Bark (Suno AI)](https://github.com/suno-ai/bark)
- [GPT-SoVITS](https://github.com/RVC-Boss/GPT-SoVITS)
- [Kokoro TTS](https://github.com/hexgrad/kokoro)
- [SpeechBrain](https://github.com/speechbrain/speechbrain)

**Voice Cloning (NUEVO):**

- [Applio](https://github.com/IAHispano/Applio)
- [RVC V2](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)

**LLM Local & Frontends:**

- [Ollama](https://ollama.com/)
- [Ollama Model Library](https://ollama.com/library)
- [Open WebUI](https://github.com/open-webui/open-webui)
- [Msty](https://msty.app/)
- [GPT4Free](https://github.com/xtekky/gpt4free)

**Computer Vision:**

- [YOLO v8](https://github.com/ultralytics/ultralytics)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)

**Game Engine:**

- [Godot 4 Docs](https://docs.godotengine.org/)

**Audio Processing (NUEVO):**

- [UVR](https://github.com/Anjok07/ultimatevocalremovergui)
- [Audiocraft](https://github.com/facebookresearch/audiocraft)

**Repositorio FMHY Completo:**

- [FMHY Wiki Index](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/index/)
- [FMHY AI Section](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/ai)
- [FMHY Dev Tools](https://www.reddit.com/r/FREEMEDIAHECKYEAH/wiki/dev-tools)

---

## 8. 🎯 Mejoras Inmediatas Recomendadas (Esta Semana)

### **Para Eira (Voz)**

1. ✅ Instalar **GPT-SoVITS** y generar voz custom de Eira
   - Grabar 1min de voz deseada
   - Entrenar modelo (15-30min en Ryzen 3)
   - Integrar en `eira_brain.py`

2. ✅ Probar **Bark** para emociones vocales
   - Eira puede "reír" cuando cuenta algo gracioso
   - Agregar contexto emocional a respuestas

### **Para Códice (Visión)**

1. ✅ Optimizar Kalman Filter (ya implementado)
2. ✅ Agregar contour validation (detección de formas)

### **Para Ambos (Infraestructura)**

1. ✅ Instalar **Open WebUI** para mejor gestión de Ollama
2. ✅ Documentar pipeline de voz en `Guia_Usuario_Codice.md`

---

**Conclusión (Actualizada):** Este roadmap combina investigación original con el descubrimiento del repositorio FMHY, agregando **15+ herramientas nuevas** todas gratuitas, open-source y optimizadas para tu hardware (Ryzen 3 + Webcam + Micrófono). Las prioridades re-evaluadas ponen **GPT-SoVITS** (clonación de voz) como crítico para personalización extrema de Eira.
