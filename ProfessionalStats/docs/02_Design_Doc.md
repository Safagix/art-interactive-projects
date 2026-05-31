# 2. Design Doc (UI/UX & Aesthetics)

## Project: ProfessionalStats

### 1. Aesthetic Identity
- **Theme:** Frutiger Aero Gamified cruzado con Quiet UI.
- **Vibe:** Sleek, focalizado, silencioso durante el trabajo, estruendoso durante las recompensas.

### 2. Color Palette (Visión Extendida)
- **Background Base:** Deep Navy/Obsidian (`#0A0F1A`) con una interfaz de "Bazar Empyreo" personalizable.
- **Spotlight Mode (Blackout):** Cuando el usuario entra en una tarea, la pantalla cae a un `rgba(0,0,0,0.9)`, ocultando el 90% del UI excepto un timer central.
- **El Valle de la Paciencia:** Modos grises suavizados, uso de lavandas pastel y acentos apacibles.
- **Paisaje del Triunfo:** Colores desaturados brillantes y vibrantes (Dorados `#FFD700`, Cyan `#4FC3F7`).

### 3. Typography & UI Anchors
- **Micro-Copy de Recompensas:** Las fuentes deben saltar con peso visual (Bold/Black) durante las celebraciones IA.
- **Generador de Recompensas Físico:** Implementación de un botón interactivo presionado (Hold Button) que obliga al usuario a anclar su dedo en un botón que diga "Celebra el Esfuerzo" por 3 segundos de llenado circular por FPS.

### 4. Vistas y Componentes Clave
- **La Pantalla de Bienvenida:** Frase motivadora flotante, cuadrícula iconográfica general para los ejes principales (Salud, Finanzas, etc.), y el Tracker de Racha global en el centro.
- **Vision Board Dinámico:** 
  - La UI requiere una capa base (mask/opacity) que encubra imágenes (propias o precargadas). Cada tag completado resta 5% de opacidad a las máscaras que lo cubren.
- **La Crónica & Matriz de Logros:**
  - Contributions Graph de racha estilo GitHub, con escalas de color de productividad.
  - Gráfico Circular (Pie/Doughnut Chart) interactivo de enfoque.

### 5. El Bazar Empireo (Gamificación Estética)
- Compra de avatares pixelados o mejoras cosméticas estilo retro mediante "Gemas de Alma" usando una UI de tienda tradicional, para incentivar el progreso visual y la persistencia lúdica.
