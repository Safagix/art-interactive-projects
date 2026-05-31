# 6. Backend Document (Supabase / Local Logic)

## Project: ProfessionalStats

### 1. Database Schema Extensions

El backend exige la inclusión de variables psicológicas que alimentarán al motor estático del frontend. En la tabla de Hábitos/Misiones (`habits`):

- `id`: uuid
- `name`: string
- `category_id`: uuid
- `difficulty_multiplier`: decimal
- **[NUEVO]** `effort_level`: int (1-10) -> *Qué tan difícil/físico/agotador es el hábito.*
- **[NUEVO]** `base_motivation`: int (1-10) -> *Qué tanta voluntad nata exige empezar.*
- **[NUEVO]** `vision_board_tags`: text[] -> *Etiquetas como [Salud], [Finanzas] usadas para descontar opacidad en el Vision Board.*

### 2. Tablas Adicionales: The Chronicle
- `daily_closures`: Tabla para registrar los estados de "Fin de Día" y generar el *Mapa de Calor* (estilo GitHub).
  - `date`: date.
  - `consistency_score`: int (1-4) (calculado en base al peso de progreso de los 4 estados de La Forja).

### 3. Row Level Security & Functions
- **Calculadora de "Consistency_Score":** Evaluadas de acuerdo a la completitud:
  - Completado = 4
  - Parcial = 2
  - Casi Nulo = 1
  - Nulo = 0

### 4. Orquestación del Sleep Data (Burnout Matrix)
- Si la app incorpora Apple Health o una API de Salud para rastrear Horas de Sueño, se almacenará en caché local `local_metrics`. No se bombardean queries en la DB para las horas de sueño diarias, sino que se sincronizan on-boot para que las verificaciones booleanas funcionen de manera instantánea y no rompan el UX por culpa del ping.
