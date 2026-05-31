# EIRA: CUERPO DIGITAL (MODO NATIVO)

Este documento define la arquitectura "Ani-Style" nativa para Eira, ejecutándose 100% en Python con PyQt6, sin depender de software externo como VTube Studio.

---

## � CONCEPTO: "CAPAS VIVAS"

Tu avatar no es un modelo 3D, es una composición inteligente de imágenes superpuestas. Es la técnica que usan muchas novelas visuales y asistentes ligeros.

### Estructura de Archivos

Crearemos una carpeta `assets` dentro de `cuerpo` con estas imágenes PNG transparentes (500x500px min):

1. **`cuerpo_base.png`**: El dibujo principal (Cara, pelo, cuello, ropa). Sin ojos ni boca (o con la piel vacía ahí).
2. **`ojos_abiertos.png`**: Solo los ojos dibujados.
3. **`ojos_cerrados.png`**: Pestañas hacia abajo (para parpadear).
4. **`boca_cerrada.png`**: Una línea pequeña o sonrisa.
5. **`boca_abierta.png`**: Boca abierta (para cuando habla).
6. **`boca_o.png`** (Opcional): Para variar la vocalización.

---

## ⚙️ MOTOR DE ANIMACIÓN (Python)

Usaremos un script dedicado (`eira_avatar.py`) que funciona así:

### 1. El Parpadeo (Auto-Blink)

* Un "Timer" interno elige un número al azar entre 3 y 6 segundos.
* Cuando se cumple, cambia la capa `ojos_abiertos` por `ojos_cerrados`.
* Espera 0.15 segundos y vuelve a abrir.
* *Resultado:* Eira se siente viva y orgánica.

### 2. Sincronización Labial (Lip-Sync)

* El script escucha una variable o señal de audio.
* **Si Volumen > 0:** Alterna rápidamente entre `boca_abierta` y `boca_cerrada` (efecto anime talking).
* **Si Volumen == 0:** Se queda en `boca_cerrada` (o `boca_neutra`).

---

## �️ TU TRABAJO (ASSETS)

Yo programaré el código, pero tú (o nosotros con IA) necesitamos conseguir las imágenes.

**Opciones:**

1. **Dibujar:** Si tienes una tableta gráfica.
2. **Generar (IA):** Usar mi herramienta de generación de imágenes para crear una "Waifu Gótica" y luego editarla en Photoshop/GIMP para separar los ojos y la boca.
3. **Recortar:** Buscar una imagen de anime que te guste y recortarle los ojos y la boca en capas separadas.

¿Cómo quieres proceder con las imágenes? ¿Intento generar una base yo?
