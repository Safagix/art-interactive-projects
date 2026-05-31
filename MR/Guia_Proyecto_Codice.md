# Guía de Proyecto Códice 2.0: El Salto Eira (MR Passthrough Avanzado)

---

## 1. 🚀 El "Catapultado" Eira: Visión y Concepto

Esta versión de Códice no es solo un visor de realidad mixta; es la **extensión espacial de MR/VisionEngine**. Utilizaremos el cerebro de Eira (LLM/Ollama) y su motor de visión optimizado (`main_eira_lab.py`) como la base sobre la cual se construye el HUD (Heads-Up Display) de Realidad Mixta.

### 1.1. Integración con MR/VisionEngine

* **Cerebro (LLM):** Eira procesará tus comandos de voz y enviará "Alertas Holográficas" directamente a tu visor en Godot.
* **Visión (Hybrid AI):** Sistema dual que combina:
  * **cvzone HandDetector** para control gestual de PC (1 mano)
  * **MediaPipe Tasks (Edge AI)** para reconocimiento avanzado de gestos (2 manos)
* **Protocolo UDP 2.0:** El Vision Engine ahora transmite datos de modo, hand count y video en tiempo real para integración con Godot.

---

## 2. 🧠 Arquitectura de IA y Optimización (Motor Códice)

### 2.1. El Problema de la Profundidad Mono-Cámara

Dado que usamos una sola cámara de celular, perdemos la percepción de profundidad.

Usaremos el motor de visión clonado en `MR/VisionEngine`:

* **Optimización Códice:** Usaremos la relación entre el landmark 0 (`WRIST`) y el 5 (`INDEX_FINGER_MCP`) para calcular la escala de la mano. A mayor escala, mayor cercanía ("Z" virtual). Esto permite que el HUD reaccione cuando "empujas" un botón holográfico en el aire.

### 2.2. Protocolo de Transmisión "Starlight-Link" (UDP)

En lugar de enviar solo un punto, enviaremos un "Packet" binario optimizado con:

1. **Hand Landmarks (21 puntos x, y, z):** Para colisiones precisas.
2. **Gesture ID:** Detectado en Python (basado en `hand_controller.py`) para reducir carga en Godot.
3. **Eira Status:** (Listening, Speaking, Memory Alert) para actualizar el HUD dinámicamente.

---

## 3. ⚙️ Implementación del HUD Holográfico (Estilo Stark)

### 3.1. Shaders de Godot (Inspiración holographic_ui.py)

Para replicar el efecto visual de Eira en 3D:

* **Blending Additive:** Los objetos no bloquean la luz del mundo real, se suman a ella.
* **Fresnel Effect:** Los hologramas brillan más en sus bordes, dándoles volumen.
* **Scanlines:** Se añade un shader de líneas de escaneo para enfatizar la naturaleza digital del HUD.

### 3.2. Passthrough Adaptativo

Implementaremos una textura de fondo que no solo es el video, sino que está filtrada en Godot para mejorar el contraste de los hologramas (ej: un ligero oscurecimiento del mundo real cuando Eira te muestra información crítica).

---

## 4. 🎮 Control Gestual POO (Extensión de Eira)

Implementaremos la clase `SpatialEiraController`:

* **Gesto "Spider-Man" (🤟):** Bloqueo/Desbloqueo del sistema (heredado de `hand_controller.py`).
* **Gesto de Pinza (👌):** Selección de elementos en el espacio 3D.
* **Gesto de Palma Extendida (🖐️):** Invocación del Menú Principal de Eira.

---

## 5. 🗺️ Roadmap de Ejecución 2.0

### Fase 1: Puente Eira-Godot

* Modificar `main_eira_lab.py` para añadir un hilo de envío UDP encargado de transmitir los landmarks detectados.
* Verificar recepción en Godot con un "Esqueleto Holográfico".

### Fase 2: Passthrough y Lente

* Configurar la cámara de Godot con el shader de **Corrección por Lente (Barrel Distortion)** necesario para visores móviles.
* Implementar el fondo de video fluido.

### Fase 3: Eira Spatial Brain

* Conectar el sistema de voz de Eira para que las respuestas aparezcan como burbujas de texto 3D o paneles de información en el HUD.

### Fase 4: Despliegue y UX

* Testeo de latencia y ajuste de suavizado (Smoothing) para que los hologramas se sientan "atados" al mundo real.
