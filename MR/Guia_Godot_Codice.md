# Directiva Técnica Godot: Construcción del HUD Estéreo "Códice" (v2.0)

Esta guía escalonada está optimizada para una **IA de Programación**. Define la arquitectura, los scripts clave y los shaders necesarios para convertir la visión de Eira en una Realidad Mixta espacial en Godot.

---

## 1. 🏗️ Configuración del Proyecto (Project Settings)

Configurar para visualización estéreo móvil usando el addon `CardboardVR`:

1. **Activación de Sensores:**
    * `Project Settings -> Input Devices -> Sensors -> Enable Gyroscope` (Obligatorio para el tracking de cabeza).
2. **Rendering:**
    * Set `Renderer` to `Compatibility`.
3. **Addon:** Asegurarse de que el plugin esté activo en `Project -> Project Settings -> Plugins`.

---

## 2. 🌳 Arquitectura de la Escena Principal (Scene Tree)

Gracias al addon `CardboardVR`, la jerarquía se simplifica drásticamente:

* `Node3D` (World)
  * `WorldEnvironment` (Fondo Negro)
  * `CardboardView` (Instancia de `addons/cardboard_vr/scenes/CardboardView.tscn`)
    * Aquí configuramos `Eyes Separation` y `Use Gyroscope` en el inspector.
  * `PassthroughLayer` (CanvasLayer o Mesh de fondo)
    * `Sprite3D` que recibe el stream de Eira.
  * `EiraHUD` (Node3D)
    * `HandCursor` (MeshInstance3D)
  * `StarlightNetwork` (Node) -> **Script de Red**

---

## 3. 📡 Script: StarlightNetwork.gd (UDP Receiver)

Implementar este script para recibir los landmarks de la mano procesados por Eira:

```gdscript
extends Node

const UDP_PORT = 4242
var server := PacketPeerUDP.new()
var hand_data : Dictionary = {}

signal hand_updated(data) # Data is now a Dictionary {x, y, z, gesture, score}

func _ready():
    if server.bind(UDP_PORT) != OK:
        print("❌ Error: No se pudo abrir el puerto UDP 4242")
    else:
        print("📡 Escuchando enlace Starlight en puerto ", UDP_PORT)

func _process(_delta):
    while server.get_available_packet_count() > 0:
        var packet = server.get_packet().get_string_from_utf8()
        var json = JSON.parse_string(packet)
        if json:
            hand_data = json
            # Nuevo Protocolo Edge AI: Pasamos todo el diccionario
            emit_signal("hand_updated", hand_data)
```

---

## 4. 🤏 Mapeo Espacial y Profundidad (Z-Scaling)

Script para el `HandCursor` que traduce coordenadas 2D de cámara a 3D de Godot:

```gdscript
extends MeshInstance3D

@export var smoothing = 0.5
@export var depth_factor = 5.0 # Controla qué tanto se aleja/acerca

func _on_starlight_network_hand_updated(landmarks, _gesture_id):
    if landmarks.size() > 8:
        # Usamos el landmark 8 (punta del índice)
        var index_tip = landmarks[8]
        
        # Mapeo X e Y (Normalizado 0-1 a espacio Godot)
        var target_x = (index_tip.x - 0.5) * 10.0
        var target_y = -(index_tip.y - 0.5) * 5.0
        
        # Lógica de Profundidad Eira 2.0:
        # Usamos la distancia entre landmark 0 y 5 como aproximación de Z
        var wrist = landmarks[0]
        var mcp = landmarks[5]
        var hand_scale = Vector2(wrist.x, wrist.y).distance_to(Vector2(mcp.x, mcp.y))
        
        # A mayor escala, menor Z (más cerca de la cámara)
        var target_z = -5.0 + (hand_scale * depth_factor)
        
        # Aplicamos suavizado
        global_position = global_position.lerp(Vector3(target_x, target_y, target_z), smoothing)
```

---

## 5. ✨ Shader: Holograma Eira (Stark Style)

Crea un `ShaderMaterial` para todos los elementos del HUD:

```glsl
shader_type b3d;
render_mode blend_add, unshaded;

uniform vec4 holo_color : source_color = vec4(0.0, 1.0, 1.0, 1.0);
uniform float blink_speed = 2.0;

void fragment() {
    // Efecto de parpadeo suave
    float pulse = (sin(TIME * blink_speed) * 0.1) + 0.9;
    
    // Efecto Fresnel simple para bordes brillantes
    float fresnel = pow(1.0 - dot(NORMAL, VIEW), 3.0);
    
    // Líneas de escaneo digitales
    float scanline = step(0.5, sin(FRAGCOORD.y * 10.0));
    
    ALBEDO = holo_color.rgb;
    ALPHA = (fresnel + 0.2 + (scanline * 0.1)) * holo_color.a * pulse;
}
```

---

## 6. � Corrección de Lente (Barrel Distortion)

El addon ya incluye un shader especializado en `addons/cardboard_vr/shaders/LensBarrelShader.gdshader`.

* Para usarlo: Se debe aplicar a un `ColorRect` que cubra toda la pantalla, dentro de un `CanvasLayer` con `Layer` alto, para que actúe como filtro final sobre la visión estéreo.

## 7. 🛠️ Próximos Pasos para la IA (Tus Tareas)

1. **Instanciar CardboardView:** Configurar el offset de ojos inicial.
2. **Video Streamer:** Crear un script que tome el frame de video enviado por Python (vía UDP o WebSocket) y lo asigne a una `ImageTexture` en el `PassthroughLayer`.
