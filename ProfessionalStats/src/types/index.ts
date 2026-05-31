// =============================================================================
// ProfessionalStats V4 — Core Type Definitions
// =============================================================================

/** The 8 competitive ranks, ordered from lowest to highest. */
export const RANKS = [
    'Iron', 'Bronze', 'Silver', 'Gold',
    'Platinum', 'Diamond', 'Immortal', 'Radiant',
] as const;

export type RankName = (typeof RANKS)[number];
export type SubDivision = 1 | 2 | 3;
export type StatCategory = string;

export const PROFILE_SCHEMA_VERSION = 2;
export const PERSONAL_CALIBRATION_VERSION = 'personal-2026-05-core-pillars-v4';

// -----------------------------------------------------------------------------
// Skill
// -----------------------------------------------------------------------------

export interface Synergy {
    targetSkillId: string;
    multiplier: number;
    description: string;
}

export interface Skill {
    id: string;
    name: string;
    icon: string;
    category: StatCategory;
    currentXP: number;
    rank: RankName;
    subDivision: SubDivision;
    decayDays: number;
    lastTrainedAt: string;
    synergies: Synergy[];
    createdAt: string;
}

// -----------------------------------------------------------------------------
// Mission (Legacy RPG system)
// -----------------------------------------------------------------------------

export type MissionType = 'daily' | 'weekly' | 'monthly';
export type MissionStatus = 'active' | 'completed' | 'expired';

export interface Mission {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    type: MissionType;
    skillId: string;
    status: MissionStatus;
    createdAt: string;
    completedAt: string | null;
}

// -----------------------------------------------------------------------------
// Habit (V4 — The Forge system)
// -----------------------------------------------------------------------------

/** The 4-state granular progress for habits */
export type HabitCompletionState = 'complete' | 'partial' | 'almost_null' | 'null';
export type DailyItemState = 'pending' | 'done' | 'partial' | 'skipped';
export type WeekdayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Habit {
    id: string;
    name: string;
    icon: string;
    category: StatCategory;
    effortLevel: number;       // 1-10 how exhausting
    baseMotivation: number;    // 1-10 how much willpower needed
    visionBoardTags: string[]; // e.g. ['Salud', 'Futuro_IA']
    completionState: HabitCompletionState;
    isDaily: boolean;
    createdAt: string;
}

// -----------------------------------------------------------------------------
// Daily Closure (V4 — Chronicle data)
// -----------------------------------------------------------------------------

export interface DailyClosure {
    date: string;              // YYYY-MM-DD
    consistencyScore: number;  // 0-4 weighted
    habitsTotal: number;
    habitsCompleted: number;
    sleepHours: number;
    closureType: 'triumph' | 'patience'; // which end-of-day screen
}

// -----------------------------------------------------------------------------
// Daily planning
// -----------------------------------------------------------------------------

export interface TimeBlockTemplate {
    id: string;
    title: string;
    description: string;
    start: string;             // HH:mm
    end: string;               // HH:mm
    category: StatCategory;
    kind: 'routine' | 'class' | 'roadmap' | 'habit' | 'recovery';
    weekdays?: WeekdayKey[];   // omitted means every day
    location?: string;
}

export interface TodayBlock extends TimeBlockTemplate {
    state: DailyItemState;
}

export interface DailyRecord {
    date: string;              // local YYYY-MM-DD
    sleepHours: number;
    habitStates: Record<string, HabitCompletionState>;
    scheduleStates: Record<string, DailyItemState>;
    notes: string;
    closedAt: string | null;
    consistencyScore: number;
    xpGained: number;
}

// -----------------------------------------------------------------------------
// Celebration Event (V4 — IRT Motor)
// -----------------------------------------------------------------------------

export interface CelebrationEvent {
    id: string;
    habitId: string;
    rngRoll: number;           // 1-10
    isEpic: boolean;           // true if 8-10
    message: string;           // AI or hardcoded reward text
    timestamp: string;
}

// -----------------------------------------------------------------------------
// Badge / Activity (preserved)
// -----------------------------------------------------------------------------

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
}

export interface ActivityEntry {
    date: string;
    xpGained: number;
    tasksCompleted: number;
}

// -----------------------------------------------------------------------------
// Cognitive Gym
// -----------------------------------------------------------------------------

export type Difficulty = 'easy' | 'medium' | 'hard';

export type CognitiveDomain =
    | 'attention'
    | 'working_memory'
    | 'processing_speed'
    | 'mental_math'
    | 'pattern_recognition'
    | 'critical_thinking'
    | 'convergent_thinking'
    | 'divergent_thinking'
    | 'cognitive_flexibility'
    | 'improvisation';

export type CognitiveExerciseId =
    | 'speed-grid'
    | 'letter-scan'
    | 'mental-math'
    | 'pattern-lab'
    | 'material-remix'
    | 'convergence-forge'
    | 'divergence-forge'
    | 'critical-ladder'
    | 'improvisation-arena'
    | 'neural-switchboard';

export interface CognitiveExercise {
    id: CognitiveExerciseId;
    title: string;
    subtitle: string;
    domain: CognitiveDomain;
    durationSeconds: number;
    difficulty: Difficulty;
    xpBase: number;
}

export interface ExerciseResult {
    exerciseId: CognitiveExerciseId;
    title: string;
    domain: CognitiveDomain;
    difficulty: Difficulty;
    score: number;
    accuracy: number;
    xpGained: number;
    durationMs: number;
    mistakes: number;
    createdAt: string;
    summary: string;
}

export interface CognitiveSession {
    id: string;
    exerciseId: CognitiveExerciseId;
    startedAt: string;
    finishedAt: string;
    result: ExerciseResult;
}

export interface CognitiveGymState {
    sessions: CognitiveSession[];
    totalXP: number;
    currentStreak: number;
    bestAccuracy: number;
    bestTimeMs: number | null;
    lastDomain: CognitiveDomain | null;
    lastSessionAt: string | null;
}

// -----------------------------------------------------------------------------
// User Profile (V4 extended)
// -----------------------------------------------------------------------------

export interface UserProfile {
    schemaVersion: number;
    calibrationVersion?: string;
    totalLevel: number;
    overallXP: number;
    title: string;
    currentStreak: number;
    longestStreak: number;
    categories: string[];
    skills: Skill[];
    missions: Mission[];
    habits: Habit[];
    dailyClosures: DailyClosure[];
    dailyRecords: Record<string, DailyRecord>;
    scheduleTemplates: TimeBlockTemplate[];
    celebrations: CelebrationEvent[];
    badges: Badge[];
    activityLog: ActivityEntry[];
    sleepHoursToday: number;
    soulGems: number;           // Currency for Bazar Empireo
    visionBoardProgress: Record<string, number>; // tag -> opacity% revealed
    lastLoginAt: string;
    createdAt: string;
}
