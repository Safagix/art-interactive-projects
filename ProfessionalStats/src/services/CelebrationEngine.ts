// =============================================================================
// CelebrationEngine — IRT (Intermittent Reinforcement Theory) Motor
// =============================================================================
// Uses a local RNG to determine reward intensity. NO AI calls for rolls 1-7.
// Only rolls 8-10 trigger epic celebrations + optional micro-AI reward text.
// =============================================================================

import type { CelebrationEvent } from '@/types';

/** Roll the invisible dice (1-10) */
export function rollCelebrationDice(): number {
    return Math.floor(Math.random() * 10) + 1;
}

/** Determine if the roll triggers an epic celebration */
export function isEpicRoll(roll: number): boolean {
    return roll >= 8;
}

// Pre-loaded hardcoded reward messages (zero tokens, instant)
const STANDARD_MESSAGES = [
    'Paso cumplido. Sigue.',
    'Registrado. Buen ritmo.',
    'Hecho. La constancia gana.',
    'Sumado. Cada paso cuenta.',
    'Check. El momentum crece.',
];

const EPIC_MESSAGES = [
    '¡Tu resiliencia acaba de subir de nivel! El esfuerzo compuesto está dando frutos.',
    '¡Momento LEGENDARIO! Este tipo de constancia construye imperios.',
    '¡ÉPICO! Acabas de demostrar que la disciplina supera al talento.',
    '¡RARO ENCONTRADO! Tu versión futura te agradecerá este momento exacto.',
    '¡CRÍTICO! Has activado un multiplicador invisible de crecimiento personal.',
    '¡ASCENSIÓN! Pocos llegan a este nivel de compromiso. Tú eres uno de ellos.',
];

/** Get a celebration message based on roll */
export function getCelebrationMessage(roll: number): string {
    if (isEpicRoll(roll)) {
        return EPIC_MESSAGES[Math.floor(Math.random() * EPIC_MESSAGES.length)];
    }
    return STANDARD_MESSAGES[Math.floor(Math.random() * STANDARD_MESSAGES.length)];
}

/** Create a full celebration event */
export function createCelebrationEvent(
    habitId: string,
    roll: number
): CelebrationEvent {
    return {
        id: crypto.randomUUID(),
        habitId,
        rngRoll: roll,
        isEpic: isEpicRoll(roll),
        message: getCelebrationMessage(roll),
        timestamp: new Date().toISOString(),
    };
}

/** Calculate soul gems earned from a completion */
export function calculateSoulGems(roll: number): number {
    if (roll >= 10) return 5;
    if (roll >= 8) return 3;
    return 1;
}
