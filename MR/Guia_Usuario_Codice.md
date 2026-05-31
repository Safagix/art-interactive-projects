# Guía de Usuario: Proyecto Códice (Hybrid Vision Engine)

**Versión:** 3.0 - Hybrid Edition  
**Fecha:** Diciembre 2024  
**Estado:** Estable (PC Desktop AR)

---

## 🎯 ¿Qué es Códice?

Códice es un **Motor de Visión Híbrido** que combina dos tecnologías de reconocimiento de manos:

- **cvzone HandDetector** para control gestual completo de PC (1 mano)
- **MediaPipe Tasks GestureRecognizer** para detección avanzada de gestos con IA (2 manos)

El sistema cambia automáticamente entre modos según cuántas manos detecte.

---

## 🚀 Inicio Rápido

### Requisitos del Sistema

- **OS:** Windows 10/11 (64-bit)
- **Procesador:** AMD Ryzen 3 o equivalente
- **Cámara:** Webcam 720p mínimo (1080p recomendado)
- **Python:** 3.10-3.12
- **Dependencias:**
  - `mediapipe==0.10.14` (versión estable)
  - `cvzone`
  - `opencv-python`
  - `numpy`
  - `pyautogui`

### Instalación

```bash
cd "MR\VisionEngine"
pip install -r requirements.txt
```

### Ejecución

**Opción 1: Script de Admin (Recomendado)**

```bash
cd "MR"
.\Start_Codice_Admin.bat
```

**Opción 2: Python Directo**

```bash
cd "MR\VisionEngine"
python main_Codice.py
```

---

## 🤖 Modos de Operación

### Modo CVZONE (1 Mano)

**Indicador Visual:** `MODE: CVZONE (1 HAND)` (verde)

Este modo activa el **control completo del PC** mediante gestos de una sola mano.

#### Gestos Disponibles

| Gesto | Acción | Descripción |
|-------|--------|-------------|
| **Índice Levantado** | Mover Mouse | Solo índice extendido, mueve el cursor suavemente |
| **Índice + Pulgar (Juntos)** | Click Izquierdo | Aproxima índice y pulgar (<3cm) |
| **Medio + Pulgar (Juntos)** | Click Derecho | Aproxima dedo medio y pulgar (<4cm) |
| **Paz (Índice + Medio)** | Scroll | Índice y medio extendidos, mano arriba = scroll up, abajo = scroll down |
| **Puño Cerrado** | Arrastrar (Drag) | Todos los dedos cerrados, mantiene el mouse presionado |
| **Shaka (Pulgar + Meñique)** | Minimizar Todo | Muestra el escritorio (Win+D), espera 2s entre usos |
| **Spider-Man (Índice + Meñique)** | Bloquear/Desbloquear | Mantener 1.5s para alternar entre locked/unlocked |

#### Estado: Locked vs. Unlocked

- **Unlocked (Activo):** Todos los gestos funcionan
- **Locked (Bloqueado):** Gestos de control desactivados, solo unlock funciona
  - Indicador: Borde rojo en pantalla + texto "LOCKED"

---

### Modo MEDIAPIPE (2 Manos)

**Indicador Visual:** `MODE: MEDIAPIPE (2 HANDS)` (magenta)

Cuando el sistema detecta **2 manos simultáneamente**, activa el modo MediaPipe para reconocimiento de gestos avanzado con IA.

#### Gestos Reconocidos (Edge AI)

MediaPipe Tasks puede detectar los siguientes gestos preentrenados:

| Gesto | Nombre | Descripción |
|-------|--------|-------------|
| ✊ | Closed_Fist | Puño cerrado |
| 🖐️ | Open_Palm | Palma abierta, dedos extendidos |
| ☝️ | Pointing_Up | Índice apuntando hacia arriba |
| 👍 | Thumb_Up | Pulgar arriba |
| 👎 | Thumb_Down | Pulgar abajo |
| ✌️ | Victory | Señal de victoria (índice + medio) |
| 🤟 | ILoveYou | Pulgar + índice + meñique extendidos |

**Nota:** En modo MediaPipe, el sistema **NO controla el PC**, solo muestra los gestos detectados en pantalla para propósitos de demostración.

#### Uso Actual

El modo 2-manos está diseñado para:

- **Demostración de gestos simultáneos**
- **Preparación para integración con Godot** (AR/MR)
- **Futuras interacciones colaborativas**

---

## 🎥 Transmisión UDP (Godot Integration)

Códice transmite datos en tiempo real por **UDP Localhost (`127.0.0.1`)**:

### Puerto 4242 (Datos de Manos)

**Formato JSON:**

```json
{
  "mode": "CVZONE",
  "hand_count": 1
}
```

o en modo MEDIAPIPE:

```json
{
  "mode": "MEDIAPIPE",
  "hand_count": 2
}
```

### Puerto 4243 (Video Stream)

- Formato: JPEG comprimido
- Resolución: 640x360px
- Calidad: 50% (optimizado para velocidad)
- FPS: Variable (depende de cámara y CPU)

---

## ⚙️ Configuración Avanzada

### Ajustes de Sensibilidad (main_Codice.py)

```python
# Línea 26: Detector cvzone
detector_cvzone = HandDetector(maxHands=2, detectionCon=0.7)
# detectionCon: 0.5 (más sensible) - 0.9 (menos sensible)

# Línea 23: Suavizado de movimiento
SMOOTHING = 3
# Menor valor = respuesta más rápida, más jitter
# Mayor valor = movimiento más suave, más lag
```

### Cambio de Camára

```python
# Línea 48: Índice de cámara
cap = cv2.VideoCapture(0)  # 0 = cámara principal
# Cambiar a 1 para DroidCam u otras virtuales
```

---

## 🐛 Resolución de Problemas

### "Unable to open zip archive"

- **Causa:** Modelo MediaPipe corrupto
- **Solución:** Ejecutar `python download_with_requests.py` para redownload

### "No camera found"

- **Causa:** Cámara no disponible en índice 0 o 1
- **Solución:** Verificar Device Manager, cambiar índice en código

### Gestos no se detectan (cvzone)

- Verificar iluminación (evitar backlight)
- Alejar mano de la cámara (distancia óptima: 40-60cm)
- Asegurar que todos los dedos estén visibles

### Lag o baja FPS

- Cerrar aplicaciones en background
- Reducir resolución de cámara en código:

  ```python
  cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
  cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
  ```

---

## 📊 Rendimiento

### Benchmarks (Ryzen 3, Webcam 720p)

| Modo | FPS Promedio | Latencia Gesto | CPU Usage |
|------|--------------|----------------|-----------|
| CVZONE (1 mano) | 28-32 | ~50ms | 15-20% |
| MEDIAPIPE (2 manos) | 22-26 | ~80ms | 25-30% |
| STANDBY (0 manos) | 30-35 | N/A | 10-12% |

---

## 🔗 Integración con Godot (Próximamente)

Códice está diseñado para enviar datos a Godot Engine para visualización AR/MR.

**Script de Godot esperado:**

```gdscript
extends Node

var server := PacketPeerUDP.new()

func _ready():
    server.bind(4242)

func _process(_delta):
    if server.get_available_packet_count() > 0:
        var packet = server.get_packet().get_string_from_utf8()
        var data = JSON.parse_string(packet)
        print("Mode: ", data["mode"])
```

---

## 📝 Changelog

### v3.0 - Hybrid Edition (Dic 2024)

- ✅ Sistema híbrido cvzone + MediaPipe
- ✅ Downgrade a MediaPipe 0.10.14 (estable)
- ✅ Auto-switch entre modos según hand count
- ✅ Optimización de gestos cvzone
- ✅ Indicadores visuales de modo

### v2.0 - Edge AI Update (Dic 2024)

- MediaPipe Tasks implementation
- Async callback architecture
- Model integrity verification

### v1.0 - Initial Release

- cvzone HandDetector
- UDP streaming
- Basic gesture control

---

**Soporte:** Para reportar bugs o sugerir mejoras, consultar `Innovation.md`
