// =============================================================================
// MissionEngine — System 2: First Win of the Day / Bounty Board
// =============================================================================
// Handles mission lifecycle: creation, completion, expiry, and "first grind"
// daily bonus (2x XP for the first task completed each day).
// =============================================================================

import type { Mission, MissionType, MissionStatus } from '@/types';
import { getLocalDateKey } from '@/services/DateService';

/** Check if a mission has expired based on its type. */
export function isMissionExpired(mission: Mission, now: Date = new Date()): boolean {
    if (mission.status === 'completed') return false;

    const created = new Date(mission.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    switch (mission.type) {
        case 'daily':
            return diffHours >= 24;
        case 'weekly':
            return diffHours >= 168; // 7 * 24
        case 'monthly':
            return diffHours >= 720; // 30 * 24
    }
}

/** Mark expired missions and return updated array. */
export function processExpiredMissions(
    missions: Mission[],
    now: Date = new Date()
): Mission[] {
    return missions.map((m) => {
        if (m.status === 'active' && isMissionExpired(m, now)) {
            return { ...m, status: 'expired' as MissionStatus };
        }
        return m;
    });
}

/** Check if the user has already completed a task today ("First Grind" check). */
export function hasCompletedToday(missions: Mission[], now: Date = new Date()): boolean {
    const todayStr = getLocalDateKey(now);
    return missions.some(
        (m) => m.status === 'completed' && m.completedAt?.startsWith(todayStr)
    );
}

/** Calculate XP reward with daily bonus applied if applicable. */
export function calculateMissionXP(
    mission: Mission,
    isFirstGrindOfDay: boolean
): number {
    const base = mission.xpReward;
    const multiplier = isFirstGrindOfDay ? 2.0 : 1.0;
    return Math.round(base * multiplier);
}

/** Complete a mission and return the updated mission object. */
export function completeMission(
    mission: Mission,
    now: Date = new Date()
): Mission {
    return {
        ...mission,
        status: 'completed',
        completedAt: now.toISOString(),
    };
}

/** Create a new mission with sensible defaults. */
export function createMission(
    title: string,
    description: string,
    xpReward: number,
    type: MissionType,
    skillId: string
): Mission {
    return {
        id: crypto.randomUUID(),
        title,
        description,
        xpReward,
        type,
        skillId,
        status: 'active',
        createdAt: new Date().toISOString(),
        completedAt: null,
    };
}

/** XP reward presets by mission type. */
export const XP_PRESETS: Record<MissionType, { min: number; default: number; max: number }> = {
    daily: { min: 25, default: 50, max: 100 },
    weekly: { min: 200, default: 350, max: 500 },
    monthly: { min: 800, default: 1500, max: 3000 },
};
