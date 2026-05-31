# 7. Security Check List (SCL)

## Project: ProfessionalStats

### 1. Hardcoding y Aislamiento IA
- [ ] **Límites de Uso de API IA (Sanity Check):** Debido a que la IA se usa como "micro-recompensas" cuando el RNG marca 8-10, existe el riesgo de llamadas excesivas si un usuario malicioso forclea finalizaciones masivas. Asegurar *Rate Limiting* en esas llamadas directamente en el Gateway/Edge Function (Supabase).
- [ ] **Aislamiento de Prompts (Prompt Injection):** Los nombres de los hábitos creados por los usuarios pasan al Prompt interno. Sanitizar el nombre del hábito antes de invocar: `(Ej: "Genera una frase para: {{sanitized_habit_name}}")`.

### 2. Autenticación y Criptografía
- [ ] **Supabase Auth:** Configurar el enrutamiento protegido completo (solo usuarios verificados pueden cargar la vista `/forge`).
- [ ] **Row Level Security (RLS):** Garantizar de forma agresiva que ningún usuario pueda leer ni modificar el `streak_count` o los `daily_closures` de otro participante, dado la alta sensibilidad (estado psicológico y sueño de la persona).

### 3. Almacenamiento Seguro
- [ ] **Token de Salud/Wearables:** Si se lee la cantidad de Horas de Sueño, las llaves y tokens de integración no pueden figurar de ningún modo expuestas en el bundle frontend de Vite. Usar llamadas RPC a Supabase exclusivamente.
