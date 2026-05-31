// =============================================================================
// DecayEngine — System 4: Loss Aversion / ELO Decay (Rust)
// =============================================================================
// Calculates XP loss and visual state based on inactivity.
// Runs on app startup to penalize neglected skills.
// =============================================================================

import type { Skill } from '@/types';

/** Visual state of a skill based on decay. */
export type DecayState = 'fresh' | 'stale' | 'rusting' | 'decayed';

/** Result of a decay check for a single skill. */
export interface DecayResult {
    skillId: string;
    daysInactive: number;
    xpLost: number;
    state: DecayState;
    streakBroken: boolean;
}

/**
 * Calculate the decay state and XP loss for a skill.
 * @param skill - The skill to check.
 * @param now   - Current date (injectable for testing).
 */
export function calculateDecay(skill: Skill, now: Date = new Date()): DecayResult {
    const lastTrained = new Date(skill.lastTrainedAt);
    const diffMs = now.getTime() - lastTrained.getTime();
    const daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let state: DecayState = 'fresh';
    let xpLost = 0;
    let streakBroken = false;

    if (daysInactive >= 14) {
        // Severe decay: lose 2% of current XP per day past 14
        state = 'decayed';
        const decayDays = daysInactive - 14;
        xpLost = Math.round(skill.currentXP * 0.02 * decayDays);
        streakBroken = true;
    } else if (daysInactive >= 7) {
        // Moderate decay: lose 1% of current XP per day past 7
        state = 'rusting';
        const decayDays = daysInactive - 7;
        xpLost = Math.round(skill.currentXP * 0.01 * decayDays);
        streakBroken = true;
    } else if (daysInactive >= 3) {
        // Warning state: no XP loss yet, but visual warning
        state = 'stale';
        streakBroken = daysInactive >= skill.decayDays;
    }

    // Never decay below 0
    xpLost = Math.min(xpLost, skill.currentXP);

    return {
        skillId: skill.id,
        daysInactive,
        xpLost,
        state,
        streakBroken,
    };
}

/**
 * Process decay for all skills.
 * Returns updated skills array and decay results for UI notifications.
 */
export function processAllDecay(
    skills: Skill[],
    now: Date = new Date()
): { updatedSkills: Skill[]; results: DecayResult[] } {
    const results: DecayResult[] = [];
    const updatedSkills = skills.map((skill) => {
        const result = calculateDecay(skill, now);
        results.push(result);

        if (result.xpLost > 0) {
            return {
                ...skill,
                currentXP: skill.currentXP - result.xpLost,
            };
        }
        return skill;
    });

    return { updatedSkills, results };
}

/** CSS opacity value based on decay state (for Frutiger Aero glow effect). */
export function getDecayOpacity(state: DecayState): number {
    switch (state) {
        case 'fresh':
            return 1.0;
        case 'stale':
            return 0.75;
        case 'rusting':
            return 0.5;
        case 'decayed':
            return 0.3;
    }
}
