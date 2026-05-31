# 3. Technical Document (Architecture & Flujo Mental)

## Project: ProfessionalStats

### Principio Base: Código Local >> Inyección de IA Limitada
El ecosistema NO enviará miles de tokens contextuales cada segundo hacia un LLM para procesar qué debe hacer el usuario. Toda la lógica de "juego", estados y bloqueos debe ocurrir en **código Typescript local / frontend eficiente**.

### 1. Motor IRT (Recompensas Variables) en Frontend
- **Mecanismo RNG Constante:** 
  Cada vez que un hábito registra estado = `1` (Completo), se ejecuta `Math.floor(Math.random() * 10) + 1`.
  - **1 a 7:** Acción básica, update DB (Supabase) + sonido pop sutil.
  - **8 a 10:** Dispara el evento `TriggerEpicCelebration()`. Inicia animación framer-motion pesada. **Sólo entonces** se llama a la API de IA (o una BD local extensa pre-llenada) para dar un payload de micro-texto único como recompensa dopamínica (ej: "Tu resiliencia física te acaba de hacer ganar").

### 2. Escudo Anti-Burnout (Matrices Booleanas)
- Evaluaciones estrictas ejecutadas durante el Mount de la vista de Bienvenida o La Forja.
  - El sistema lee las variables previas agregadas. 
  - **Regla Domiciliada:** `if (rachaDias > 15 && averageSleepHoursRegistred < 6)`.
  - **Consecuencia (Action Dispatch):** Si == `true`, se despacha el estado global `setUxBlock(true)`. Bloquea la navegación `<Router>` y fuerza la renderización de la pantalla de *"NSDR/Yoga Nidra de 10 min"*.  
  - **Eficiencia:** 0% de uso de tokens IA. Frases hardcodeadas optimizadas para recuperación (`[const ANTI_BURNOUT_STRINGS]`).

### 3. Estructuración del Vision Board (Tags)
- Los tags creados ligarán sus IDs matemáticamente con una matriz Opacity (100% -> 0%). Esto significa que el cliente React manejará un global state que escuche hooks de actualización de hábitos finalizados e impacte el Vision Board de fondo sin queries pesadas y de manera inmediata, optimistico.

### 4. Base Stack
- React / Next.js / Vite (SPA mode)
- Backend y DB: Supabase (Postgres RLS constraints)
- Estado de animaciones: Framer Motion
- Motor local de Lógica: TypeScript (Context / Zustand API)
