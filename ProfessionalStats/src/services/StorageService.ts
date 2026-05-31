// =============================================================================
// StorageService — Persistence Layer
// =============================================================================
// Abstracts localStorage read/write. Easily swappable to Supabase/Firebase later.
// =============================================================================

import { PERSONAL_CALIBRATION_VERSION, PROFILE_SCHEMA_VERSION, type UserProfile } from '@/types';
import {
    DEFAULT_CATEGORIES,
    DEFAULT_SCHEDULE_TEMPLATES,
    getDefaultHabits,
    getDefaultMissions,
    getDefaultSkills,
} from '@/services/DailyPlanService';
import {
    PERSONAL_ACTIVITY_LOG,
    PERSONAL_BADGES,
    PERSONAL_NOTES,
    PERSONAL_TIMELINE_CLOSURES,
    applyPersonalCalibration,
    mergePersonalScheduleNotes,
} from '@/services/PersonalCalibrationService';

const STORAGE_KEY = 'professionalstats_profile';

/** Save the full user profile to localStorage. */
export function saveProfile(profile: UserProfile): void {
    try {
        const json = JSON.stringify(profile);
        localStorage.setItem(STORAGE_KEY, json);
    } catch (error) {
        console.error('[StorageService] Failed to save profile:', error);
    }
}

/** Load the user profile from localStorage. Returns null if none exists. */
export function loadProfile(): UserProfile | null {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return null;
        return migrateProfile(JSON.parse(json));
    } catch (error) {
        console.error('[StorageService] Failed to load profile:', error);
        return null;
    }
}

export function validateProfileImport(data: unknown): UserProfile | null {
    if (!data || typeof data !== 'object') return null;
    const candidate = data as Partial<UserProfile>;
    if (!Array.isArray(candidate.skills) || !Array.isArray(candidate.missions)) return null;
    if (!candidate.createdAt || typeof candidate.createdAt !== 'string') return null;
    return migrateProfile(candidate);
}

export function applyCalibrationToProfile(profile: UserProfile): UserProfile {
    return applyPersonalCalibration(migrateProfile(profile));
}

/** Check if a profile exists in storage. */
export function hasProfile(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

/** Clear profile data from storage. */
export function clearProfile(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/** Generate a fresh default profile for first-time users. */
export function createDefaultProfile(): UserProfile {
    const now = new Date().toISOString();
    const skills = getDefaultSkills(now);
    const overallXP = skills.reduce((sum, skill) => sum + skill.currentXP, 0);
    return {
        schemaVersion: PROFILE_SCHEMA_VERSION,
        calibrationVersion: PERSONAL_CALIBRATION_VERSION,
        totalLevel: Math.max(3, Math.min(6, Math.floor(overallXP / 22000) + 1)),
        overallXP,
        title: 'Becado Itaipu · Builder en progreso',
        currentStreak: 1,
        longestStreak: 4,
        categories: DEFAULT_CATEGORIES,
        skills,
        missions: getDefaultMissions(now),
        habits: getDefaultHabits(now),
        dailyClosures: PERSONAL_TIMELINE_CLOSURES,
        dailyRecords: {},
        scheduleTemplates: mergePersonalScheduleNotes(DEFAULT_SCHEDULE_TEMPLATES),
        celebrations: [],
        badges: PERSONAL_BADGES,
        activityLog: PERSONAL_ACTIVITY_LOG,
        sleepHoursToday: 7,
        soulGems: 0,
        visionBoardProgress: {
            Autoconocimiento: 72,
            Salud: 58,
            Trabajo_IA: 28,
            Beca_Itaipu: 86,
        },
        lastLoginAt: now,
        createdAt: now,
    };
}

function migrateProfile(input: unknown): UserProfile {
    const base = createDefaultProfile();
    const raw = (input && typeof input === 'object' ? input : {}) as Partial<UserProfile>;

    const mergedSkills = mergeSkillsWithCalibration(base.skills, raw.skills);
    const migratedBase: UserProfile = {
        ...base,
        ...raw,
        schemaVersion: PROFILE_SCHEMA_VERSION,
        calibrationVersion: raw.calibrationVersion,
        categories: mergeUnique(base.categories, raw.categories),
        skills: mergedSkills,
        missions: mergeById(base.missions, raw.missions),
        habits: mergeById(base.habits, raw.habits),
        dailyClosures: mergeClosures(PERSONAL_TIMELINE_CLOSURES, raw.dailyClosures),
        dailyRecords: raw.dailyRecords ?? {},
        scheduleTemplates: raw.scheduleTemplates?.length
            ? mergePersonalScheduleNotes(raw.scheduleTemplates)
            : base.scheduleTemplates,
        celebrations: raw.celebrations ?? [],
        badges: raw.badges ?? [],
        activityLog: raw.activityLog ?? [],
        sleepHoursToday: raw.sleepHoursToday ?? base.sleepHoursToday,
        soulGems: raw.soulGems ?? base.soulGems,
        visionBoardProgress: {
            Autoconocimiento: 72,
            Salud: 58,
            Trabajo_IA: 28,
            Beca_Itaipu: 86,
            ...(raw.visionBoardProgress ?? {}),
        },
        overallXP: Math.max(raw.overallXP ?? 0, mergedSkills.reduce((sum, skill) => sum + skill.currentXP, 0)),
        title: raw.title && raw.title !== 'Novice' ? raw.title : base.title,
        totalLevel: Math.max(3, Math.min(6, Math.floor(mergedSkills.reduce((sum, skill) => sum + skill.currentXP, 0) / 22000) + 1)),
        lastLoginAt: new Date().toISOString(),
        createdAt: raw.createdAt ?? '2025-03-01T08:00:00.000Z',
    };

    let migrated = migratedBase;
    if (!migrated.dailyRecords['2025-01-01']) {
        migrated = {
            ...migrated,
            dailyRecords: {
                ...migrated.dailyRecords,
                '2025-01-01': {
                    date: '2025-01-01',
                    sleepHours: 8,
                    habitStates: {},
                    scheduleStates: {},
                    notes: PERSONAL_NOTES,
                    closedAt: new Date().toISOString(),
                    consistencyScore: 3,
                    xpGained: 0,
                },
            },
        };
    }

    if (migrated.calibrationVersion !== PERSONAL_CALIBRATION_VERSION) {
        migrated = applyPersonalCalibration(migrated);
    }

    return migrated;
}

function mergeUnique(defaults: string[], values?: string[]): string[] {
    return Array.from(new Set([...(values ?? []), ...defaults]));
}

function mergeById<T extends { id: string }>(defaults: T[], values?: T[]): T[] {
    const byId = new Map(defaults.map((item) => [item.id, item]));
    for (const item of values ?? []) {
        byId.set(item.id, item);
    }
    return Array.from(byId.values());
}

function mergeSkillsWithCalibration(defaults: UserProfile['skills'], values?: UserProfile['skills']): UserProfile['skills'] {
    return applyPersonalCalibration({
        ...createDefaultProfile(),
        skills: mergeById(defaults, values),
    }).skills;
}

function mergeClosures(defaults: UserProfile['dailyClosures'], values?: UserProfile['dailyClosures']): UserProfile['dailyClosures'] {
    const byDate = new Map(defaults.map((item) => [item.date, item]));
    for (const item of values ?? []) {
        byDate.set(item.date, item);
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
