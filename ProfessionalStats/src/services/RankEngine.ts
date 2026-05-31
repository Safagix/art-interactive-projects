// =============================================================================
// RankEngine — System 1: Ranked Progression (Iron → Radiant)
// =============================================================================
// Pure functions for XP→Rank conversion, rank-up detection, and XP thresholds.
// No side effects, no state mutation — only calculations.
// =============================================================================

import { RANKS, type RankName, type SubDivision, type Skill } from '@/types';

export { RANKS };

/** XP required per rank (base). Each sub-division multiplies this. */
const RANK_BASE_XP: Record<RankName, number> = {
    Iron: 300,
    Bronze: 600,
    Silver: 1000,
    Gold: 1800,
    Platinum: 3000,
    Diamond: 5000,
    Immortal: 8000,
    Radiant: 15000,
};

/** Total XP needed to complete a specific rank + sub-division. */
export function getXPForSubDivision(rank: RankName, sub: SubDivision): number {
    return RANK_BASE_XP[rank] * sub;
}

/** Total XP accumulated from Iron 1 up to (but not including) a given rank+sub. */
export function getTotalXPUpTo(rank: RankName, sub: SubDivision): number {
    let total = 0;
    for (const r of RANKS) {
        for (const s of [1, 2, 3] as SubDivision[]) {
            if (r === rank && s === sub) return total;
            total += getXPForSubDivision(r, s);
        }
    }
    return total;
}

/** Calculate the rank and sub-division from a total XP value. */
export function getRankFromXP(totalXP: number): {
    rank: RankName;
    subDivision: SubDivision;
    xpInCurrentSub: number;
    xpForCurrentSub: number;
    progressPercent: number;
} {
    let remaining = totalXP;

    for (const rank of RANKS) {
        for (const sub of [1, 2, 3] as SubDivision[]) {
            const required = getXPForSubDivision(rank, sub);
            if (remaining < required) {
                return {
                    rank,
                    subDivision: sub,
                    xpInCurrentSub: remaining,
                    xpForCurrentSub: required,
                    progressPercent: Math.min(100, Math.round((remaining / required) * 100)),
                };
            }
            remaining -= required;
        }
    }

    // Max rank reached
    return {
        rank: 'Radiant',
        subDivision: 3,
        xpInCurrentSub: remaining,
        xpForCurrentSub: getXPForSubDivision('Radiant', 3),
        progressPercent: 100,
    };
}

/** Check if adding XP to a skill triggers a rank-up event. */
export function detectRankUp(
    skill: Skill,
    xpToAdd: number
): { didRankUp: boolean; oldRank: RankName; newRank: RankName; oldSub: SubDivision; newSub: SubDivision } {
    const oldInfo = getRankFromXP(skill.currentXP);
    const newInfo = getRankFromXP(skill.currentXP + xpToAdd);

    const didRankUp =
        oldInfo.rank !== newInfo.rank || oldInfo.subDivision !== newInfo.subDivision;

    return {
        didRankUp,
        oldRank: oldInfo.rank,
        newRank: newInfo.rank,
        oldSub: oldInfo.subDivision,
        newSub: newInfo.subDivision,
    };
}

/** Get the rank index (0-7) for comparison. */
export function getRankIndex(rank: RankName): number {
    return RANKS.indexOf(rank);
}

/** Visual color associated with each rank. */
export const RANK_COLORS: Record<RankName, string> = {
    Iron: '#5C5C5C',
    Bronze: '#CD7F32',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#87CEEB',
    Diamond: '#B9F2FF',
    Immortal: '#FF4655',
    Radiant: '#FFFFAA',
};

/** Rank display label with sub-division. */
export function getRankLabel(rank: RankName, sub: SubDivision): string {
    if (rank === 'Radiant') return 'Radiant'; // No subs for Radiant
    return `${rank} ${['I', 'II', 'III'][sub - 1]}`;
}
