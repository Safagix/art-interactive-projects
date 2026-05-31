// =============================================================================
// SynergyEngine — System 3: Skill Synergies & Multipliers
// =============================================================================
// Calculates XP bonuses based on skill interconnections.
// When a skill gains XP, linked skills receive bonus XP via multipliers.
// =============================================================================

import type { Skill, Synergy } from '@/types';

/** Result of a synergy calculation after gaining XP on a skill. */
export interface SynergyResult {
    skillId: string;
    skillName: string;
    bonusXP: number;
    multiplier: number;
    description: string;
}

/**
 * Calculate all synergy bonuses triggered when a skill gains XP.
 * @param sourceSkill - The skill that just gained XP.
 * @param baseXP      - The base XP gained before synergies.
 * @param allSkills   - All user skills (to find linked targets).
 * @returns Array of synergy results (bonus XP per target skill).
 */
export function calculateSynergies(
    sourceSkill: Skill,
    baseXP: number,
    allSkills: Skill[]
): SynergyResult[] {
    const results: SynergyResult[] = [];

    for (const synergy of sourceSkill.synergies) {
        const target = allSkills.find((s) => s.id === synergy.targetSkillId);
        if (!target) continue;

        const bonusXP = Math.round(baseXP * synergy.multiplier);
        if (bonusXP <= 0) continue;

        results.push({
            skillId: target.id,
            skillName: target.name,
            bonusXP,
            multiplier: synergy.multiplier,
            description: synergy.description,
        });
    }

    return results;
}

/**
 * Get total XP multiplier for a skill based on all OTHER skills that
 * have synergies pointing TO this skill.
 * This is the "passive buff" — other skills boosting your learning.
 */
export function getPassiveMultiplier(
    targetSkillId: string,
    allSkills: Skill[]
): number {
    let totalMultiplier = 1.0; // base = 100%

    for (const skill of allSkills) {
        for (const syn of skill.synergies) {
            if (syn.targetSkillId === targetSkillId) {
                totalMultiplier += syn.multiplier;
            }
        }
    }

    return totalMultiplier;
}

/** Predefined synergy templates for common skill combinations. */
export const SYNERGY_TEMPLATES: Record<string, Synergy[]> = {
    english: [
        {
            targetSkillId: '', // to be resolved dynamically
            multiplier: 0.15,
            description: 'English proficiency boosts documentation reading (+15% XP)',
        },
    ],
    react: [
        {
            targetSkillId: '',
            multiplier: 0.10,
            description: 'React knowledge accelerates full-stack development (+10% XP)',
        },
    ],
};
