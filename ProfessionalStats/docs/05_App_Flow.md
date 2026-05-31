# 5. App Flow Document

## Project: ProfessionalStats

### 1. El Core Journey de la Interacción Diaria

A continuación se grafica el flujo desde que el usuario abarca la app en un día nuevo, demostrando la evaluación conductual.

```mermaid
graph TD
    A[Inicio: Pantalla de Bienvenida] --> B{Lectura de Racha & Sueño local};
    B -- Racha > 15 & Sueño < 6 --> C[Bloqueo Global: Prevención Burnout];
    C --> D[Obligar NSDR / Yoga Nidra];
    D --> E[Cierre Forzado - Valle de Paciencia];
    
    B -- Estado Sano --> F[La Forja: Vista de Hábitos];
    F --> G[Spotlight Mode Local];
    
    G --> H{Cierre del Hábito};
    H -- Rango 1-7 (RNG) --> I[Update Local + Sonido Pop];
    H -- Rango 8-10 (RNG) --> J[Celebration Engine \n Pulsación 3 Segundos];
    J --> K[Micro-llamada IA: Recompensa Única];
    
    K --> L{Fin del Día};
    I --> L;
    
    L -- Metas al 100% --> M[Paisaje del Triunfo];
    L -- Metas Fallidas (Casi nulo/Nulo) --> N[Valle de la Paciencia];
```

### 2. Flujo de Navegación Estático
- `/` -> **Bienvenida** (Dato: `streak_count`, `daily_quote`)
- `/forge` -> **La Forja** (Dato: 4 estados de progreso granular)
- `/chronicle` -> **La Crónica** (Dato: Mapa de calor, Gráficos de Categoría y Logros pasados)
- `/bazaar` -> **El Bazar Empireo** (Dato: Personalización y Avatar upgrades)
