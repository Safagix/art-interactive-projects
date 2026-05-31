# Ideas a Realizar - Estructura de la Aplicación y Arquitectura Mental

## 1. El Plano General: Visión Estratégica
El sistema opera no como un simple gestor de tareas o un jefe exigente, sino como un **ecosistema cerrado que monitorea dos ejes: Ejecución (lo que haces) y Estado Emocional (cómo te sientes).** Actúa como un *Escudo* y un *Facilitador*.
- Fomenta la **Pasión Armoniosa** (enfoque en el esfuerzo) mediante recompensas y frena la **Pasión Obsesiva** (adicción ciega a los resultados).

## 2. Pantalla de Bienvenida (La Pantalla del "Comienzo del Día")
- **Ritual Diario con Mensaje Matutino:** Es la primera pantalla que ve el usuario. Muestra una frase motivadora aleatoria (ej. *"El primer paso es el más valioso."*) y un botón claro para "Comenzar el Día".
- **Contador de Racha (Streaks):** Un indicador visual destacado que muestra días consecutivos completando metas. Ayuda a demostrar la constancia.
- **Visión Global de Metas:** Cuadrícula de iconos representando áreas de vida (Salud, Estudio, Finanzas). Al pulsar en ellas, se ve el progreso general.

## 3. La Forja (Pantalla de Gestión de Hábitos y Tareas)
- **Spotlight Mode (Enfoque Total):** Diseño visual inmersivo. Al pulsar un hábito a cumplir, el 90% de la pantalla se oscurece eliminando el ruido visual, dejando únicamente la tarea y el temporizador en el centro.
- **Sección de Metas Semanales:** Panel dedicado a los objetivos semanales donde visualizar el progreso y tachar metas complejas.
- **Creación y Lista de Hábitos Evaluados:** Zona de creación de hábitos, solicitando clasificar su *Nivel de Esfuerzo (1-10)* y su *Motivación Base (1-10)*.
- **Registro de Progreso Granular:** Selector con 4 estados precisos (Completo, Parcial, Casi Nulo, Nulo) para un control honesto y medible.
- **Arquitectura de Notificaciones Inteligentes:**
  - **Facilitator Prompts:** Si es tarde y falta un hábito de *Baja Motivación/Alto Esfuerzo*, el sistema pide algo minúsculo (ej. "No hagas la rutina, lee 1 solo párrafo").
  - **Spark Prompts:** Para hábitos de *Alta Motivación/Alto Esfuerzo*, envía una narrativa épica (ej. "Tu squad depende de que forjes esta habilidad hoy").

## 4. La Crónica (Pantalla de Estadísticas e Historial)
- **Matriz de Logros:** Cuadrícula de iconos únicos detallados que se desbloquean al alcanzar hitos (ej. "10 tareas completadas").
- **Mapa de Calor de Constancia (Streaks):** Gráfico estilo GitHub que visualiza la intensidad de la productividad del usuario, día a día.
- **Análisis de Enfoque por Categoría:** Gráfico circular detallado de esfuerzo y tiempo invertido por cada categoría personal.
- **Vision Board Dinámico:** Las etiquetas/tags de los hábitos (ej. `[Futuro_IA]`) se ligan a imágenes. Cada hábito completado "revela" (desenmascara) un 5% de la imagen de fondo de tus metas a largo plazo.
- **Histórico de Logros Editable:** Buscador de registros del pasado.

## 5. El Bazar Empireo (Pantalla de Personalización y Tienda)
- **Personalización Total del Panel:** Elección de temas de color, modos, paquetes de iconos y fuentes (haciendo el entorno motivador a nivel estético).
- **Tienda de Evolución del Avatar:** Gasta "Gemas de Alma" (moneda ganada por constancia) para desbloquear mejoras y apariencia para tu avatar pixelado.

## 6. Motor de Recompensas Variables (IRT) y Cierre del Día
- **Animaciones RNG (Random Number Generator):** El sistema tira un "dado" invisible (1-10) al completar un hábito. Si sale 8, 9 o 10, estalla la animación épica (efectos, sonido) para dar recompensas variables que generan dopamina. 
- **Celebration Engine:** Anclaje físico. Tras un gran esfuerzo, la interfaz exige mantener pulsado un botón de "Celebra el esfuerzo" durante 3 segundos para asimilar la victoria mentalmente.
- **Micro-llamadas a la IA:** Cuando sale el premio mayor, se inyecta la API de IA para un elogio ultra-personalizado ("Ese esfuerzo acaba de subir tu resiliencia"). Todo lo menor usa textos predefinidos para optimizar rendimiento.
- **Paisaje del Triunfo / Valle de la Paciencia:** Pantallas de fin del día hermosas y pixeladas. Unas felicitan el éxito absoluto, y el Valle calma la frustración si fallaste los objetivos.

## 7. Escudo de Energía & Prevención de Burnout (ENFJ Logic)
- **Bloqueo Inteligente Anti-Burnout:** La App usa matrices booleanas en el código local sin tokens. Ejecuta verificaciones (Ej: Si `Racha_Dias > 15` Y `Horas_Sueño < 6`).
- **UX Block / Refugio:** Al detonar la alerta de Pasión Obsesiva, la app se bloquea preventivamente, oscurece la interfaz, y frena el inicio de hábitos.
- **Asistencia Automática:** Se ofrece forzosamente una actividad de recuperación: "Iniciando NSDR (Yoga Nidra) de 10 min. Tu bienestar es el vehículo."

## 8. El Flujo Mental Eficiente (AI Understanding)
- **Estrategia Cero-Excesos:** En vez de que la IA evalúe cada click del usuario leyendo gigas de historial, el **Código Local** (Vite/Supabase) domina.
- Las **Reglas Locales** monitorean umbrales. Solo cuando un estado específico (`Estado_Burnout`, `Victoria_Épica`) cruza el límite, se inyecta la invocación LLM con un *micro-texto* muy condicionado (ej. "Felicia este progreso con 10 palabras sobre disciplina física"). Escalarabilidad garantizada.
