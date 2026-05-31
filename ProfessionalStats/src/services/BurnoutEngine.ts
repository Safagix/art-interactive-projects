// =============================================================================
// BurnoutEngine — ENFJ Logic (Boolean Matrix Anti-Burnout Shield)
// =============================================================================
// Pure local code. Zero AI tokens. Detects destructive patterns and triggers
// UX blocks to protect the user from obsessive passion spirals.
// =============================================================================

export interface BurnoutCheck {
    isBlocked: boolean;
    reason: string | null;
    suggestion: string;
}

// Hardcoded anti-burnout strings (curated, never random)
const ANTI_BURNOUT_STRINGS = [
    'Tu bienestar es el vehículo. Sin él, no hay destino.',
    'La recuperación no es debilidad — es mantenimiento del sistema.',
    'Descansa hoy para poder conquistar mañana.',
    'Tu cuerpo te está pidiendo una pausa. Escúchalo.',
    'Los mejores atletas del mundo duermen 8+ horas. Tú también deberías.',
    'Hoy el mayor acto de disciplina es descansar.',
];

/**
 * The core boolean matrix evaluation.
 * Runs on app mount — checks streak vs sleep patterns.
 */
export function evaluateBurnoutRisk(
    streakDays: number,
    averageSleepHours: number
): BurnoutCheck {
    // Rule 1: High streak + low sleep = Obsessive Passion detected
    if (streakDays > 15 && averageSleepHours < 6) {
        return {
            isBlocked: true,
            reason: 'Pasión Obsesiva detectada: racha alta con sueño insuficiente.',
            suggestion: ANTI_BURNOUT_STRINGS[
                Math.floor(Math.random() * ANTI_BURNOUT_STRINGS.length)
            ],
        };
    }

    // Rule 2: Extreme streak without rest days
    if (streakDays > 30 && averageSleepHours < 7) {
        return {
            isBlocked: true,
            reason: 'Maratón sin descanso: 30+ días sin pausa adecuada.',
            suggestion: 'Iniciando NSDR (Yoga Nidra) de 10 min. Tu bienestar es el vehículo.',
        };
    }

    return {
        isBlocked: false,
        reason: null,
        suggestion: '',
    };
}

/**
 * Calculate the consistency score from the 4-state habit system.
 * Complete=4, Partial=2, AlmostNull=1, Null=0
 */
export function calculateConsistencyScore(
    states: Array<'complete' | 'partial' | 'almost_null' | 'null'>
): number {
    const scores: Record<string, number> = {
        complete: 4,
        partial: 2,
        almost_null: 1,
        null: 0,
    };
    if (states.length === 0) return 0;
    const total = states.reduce((sum, s) => sum + (scores[s] || 0), 0);
    return Math.round(total / states.length);
}
