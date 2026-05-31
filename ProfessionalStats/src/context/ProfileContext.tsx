// =============================================================================
// ProfileContext — Central State Management (React Context + Reducer)
// =============================================================================

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from 'react';
import type {
    ActivityEntry,
    Badge,
    DailyItemState,
    DailyRecord,
    HabitCompletionState,
    Mission,
    Skill,
    UserProfile,
} from '@/types';
import { createDefaultProfile, loadProfile, saveProfile } from '@/services/StorageService';
import { getRankFromXP } from '@/services/RankEngine';
import { processAllDecay, type DecayResult } from '@/services/DecayEngine';
import { calculateMissionXP, completeMission as completeMissionFn, hasCompletedToday, processExpiredMissions } from '@/services/MissionEngine';
import { calculateSynergies } from '@/services/SynergyEngine';
import { getLocalDateKey } from '@/services/DateService';
import { calculateDailyScore, createDailyRecord, getDailyRecord, getTodayBlocks } from '@/services/DailyPlanService';

type Action =
    | { type: 'LOAD_PROFILE'; payload: UserProfile }
    | { type: 'ADD_SKILL'; payload: Skill }
    | { type: 'REMOVE_SKILL'; payload: string }
    | { type: 'ADD_MISSION'; payload: Mission }
    | { type: 'COMPLETE_MISSION'; payload: { missionId: string } }
    | { type: 'ADD_XP'; payload: { skillId: string; xp: number } }
    | { type: 'APPLY_DECAY'; payload: { updatedSkills: Skill[] } }
    | { type: 'ADD_BADGE'; payload: Badge }
    | { type: 'LOG_ACTIVITY'; payload: ActivityEntry }
    | { type: 'UPDATE_STREAK' }
    | { type: 'ADD_CATEGORY'; payload: string }
    | { type: 'REMOVE_CATEGORY'; payload: string }
    | { type: 'RENAME_CATEGORY'; payload: { oldName: string; newName: string } }
    | { type: 'SET_PROFILE'; payload: Partial<UserProfile> }
    | { type: 'SET_SLEEP_HOURS'; payload: { date?: string; sleepHours: number } }
    | { type: 'UPDATE_HABIT_STATE'; payload: { habitId: string; state: HabitCompletionState; date?: string } }
    | { type: 'UPDATE_SCHEDULE_STATE'; payload: { blockId: string; state: DailyItemState; date?: string } }
    | { type: 'UPDATE_DAILY_NOTES'; payload: { notes: string; date?: string } }
    | { type: 'CLOSE_DAY'; payload?: { date?: string } };

function profileReducer(state: UserProfile, action: Action): UserProfile {
    switch (action.type) {
        case 'LOAD_PROFILE':
            return action.payload;

        case 'ADD_SKILL':
            return { ...state, skills: [...state.skills, action.payload] };

        case 'REMOVE_SKILL':
            return { ...state, skills: state.skills.filter((s) => s.id !== action.payload) };

        case 'ADD_MISSION':
            return { ...state, missions: [...state.missions, action.payload] };

        case 'COMPLETE_MISSION':
            return completeMissionInState(state, action.payload.missionId);

        case 'ADD_XP': {
            const updatedSkills = state.skills.map((skill) => {
                if (skill.id !== action.payload.skillId) return skill;
                const newXP = skill.currentXP + action.payload.xp;
                const rankInfo = getRankFromXP(newXP);
                return {
                    ...skill,
                    currentXP: newXP,
                    rank: rankInfo.rank,
                    subDivision: rankInfo.subDivision,
                    lastTrainedAt: new Date().toISOString(),
                };
            });
            return { ...state, skills: updatedSkills, overallXP: state.overallXP + action.payload.xp };
        }

        case 'APPLY_DECAY':
            return { ...state, skills: action.payload.updatedSkills };

        case 'ADD_BADGE':
            return { ...state, badges: [...state.badges, action.payload] };

        case 'LOG_ACTIVITY':
            return { ...state, activityLog: upsertActivity(state.activityLog, action.payload) };

        case 'UPDATE_STREAK':
            return updateStreakForDate(state, getLocalDateKey());

        case 'ADD_CATEGORY':
            if (state.categories.includes(action.payload)) return state;
            return { ...state, categories: [...state.categories, action.payload] };

        case 'REMOVE_CATEGORY':
            return { ...state, categories: state.categories.filter((category) => category !== action.payload) };

        case 'RENAME_CATEGORY': {
            const updatedCategories = state.categories.map((category) =>
                category === action.payload.oldName ? action.payload.newName : category
            );
            const updatedSkills = state.skills.map((skill) =>
                skill.category === action.payload.oldName ? { ...skill, category: action.payload.newName } : skill
            );
            const updatedHabits = state.habits.map((habit) =>
                habit.category === action.payload.oldName ? { ...habit, category: action.payload.newName } : habit
            );
            return { ...state, categories: updatedCategories, skills: updatedSkills, habits: updatedHabits };
        }

        case 'SET_PROFILE':
            return { ...state, ...action.payload };

        case 'SET_SLEEP_HOURS': {
            const date = action.payload.date ?? getLocalDateKey();
            const record = getDailyRecord(state, date);
            return {
                ...state,
                sleepHoursToday: action.payload.sleepHours,
                dailyRecords: {
                    ...state.dailyRecords,
                    [date]: { ...record, sleepHours: action.payload.sleepHours },
                },
            };
        }

        case 'UPDATE_HABIT_STATE': {
            const date = action.payload.date ?? getLocalDateKey();
            const record = getDailyRecord(state, date);
            const dailyRecord: DailyRecord = {
                ...record,
                habitStates: {
                    ...record.habitStates,
                    [action.payload.habitId]: action.payload.state,
                },
            };
            return {
                ...state,
                habits: state.habits.map((habit) =>
                    habit.id === action.payload.habitId ? { ...habit, completionState: action.payload.state } : habit
                ),
                dailyRecords: { ...state.dailyRecords, [date]: dailyRecord },
            };
        }

        case 'UPDATE_SCHEDULE_STATE': {
            const date = action.payload.date ?? getLocalDateKey();
            const record = getDailyRecord(state, date);
            return {
                ...state,
                dailyRecords: {
                    ...state.dailyRecords,
                    [date]: {
                        ...record,
                        scheduleStates: {
                            ...record.scheduleStates,
                            [action.payload.blockId]: action.payload.state,
                        },
                    },
                },
            };
        }

        case 'UPDATE_DAILY_NOTES': {
            const date = action.payload.date ?? getLocalDateKey();
            const record = getDailyRecord(state, date);
            return {
                ...state,
                dailyRecords: {
                    ...state.dailyRecords,
                    [date]: { ...record, notes: action.payload.notes },
                },
            };
        }

        case 'CLOSE_DAY':
            return closeDayInState(state, action.payload?.date ?? getLocalDateKey());

        default:
            return state;
    }
}

interface ProfileContextType {
    profile: UserProfile;
    dispatch: React.Dispatch<Action>;
    addSkill: (skill: Skill) => void;
    removeSkill: (id: string) => void;
    addMission: (mission: Mission) => void;
    completeMission: (missionId: string) => void;
    addXP: (skillId: string, xp: number) => void;
    runDecayCheck: () => DecayResult[];
    runMissionExpiry: () => void;
    addCategory: (name: string) => void;
    removeCategory: (name: string) => void;
    renameCategory: (oldName: string, newName: string) => void;
    setSleepHours: (sleepHours: number, date?: string) => void;
    updateHabitState: (habitId: string, state: HabitCompletionState, date?: string) => void;
    updateScheduleState: (blockId: string, state: DailyItemState, date?: string) => void;
    updateDailyNotes: (notes: string, date?: string) => void;
    closeDay: (date?: string) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

function initProfile(): UserProfile {
    return loadProfile() ?? createDefaultProfile();
}

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, dispatch] = useReducer(profileReducer, undefined as never, initProfile);

    useEffect(() => {
        saveProfile(profile);
    }, [profile]);

    const addSkill = useCallback((skill: Skill) => dispatch({ type: 'ADD_SKILL', payload: skill }), []);
    const removeSkill = useCallback((id: string) => dispatch({ type: 'REMOVE_SKILL', payload: id }), []);
    const addMission = useCallback((mission: Mission) => dispatch({ type: 'ADD_MISSION', payload: mission }), []);
    const completeMission = useCallback((missionId: string) => dispatch({ type: 'COMPLETE_MISSION', payload: { missionId } }), []);
    const addXP = useCallback((skillId: string, xp: number) => dispatch({ type: 'ADD_XP', payload: { skillId, xp } }), []);

    const runDecayCheck = useCallback((): DecayResult[] => {
        const { updatedSkills, results } = processAllDecay(profile.skills);
        dispatch({ type: 'APPLY_DECAY', payload: { updatedSkills } });
        return results;
    }, [profile.skills]);

    const runMissionExpiry = useCallback(() => {
        dispatch({ type: 'SET_PROFILE', payload: { missions: processExpiredMissions(profile.missions) } });
    }, [profile.missions]);

    const addCategory = useCallback((name: string) => dispatch({ type: 'ADD_CATEGORY', payload: name }), []);
    const removeCategory = useCallback((name: string) => dispatch({ type: 'REMOVE_CATEGORY', payload: name }), []);
    const renameCategory = useCallback((oldName: string, newName: string) => {
        dispatch({ type: 'RENAME_CATEGORY', payload: { oldName, newName } });
    }, []);
    const setSleepHours = useCallback((sleepHours: number, date?: string) => {
        dispatch({ type: 'SET_SLEEP_HOURS', payload: { sleepHours, date } });
    }, []);
    const updateHabitState = useCallback((habitId: string, state: HabitCompletionState, date?: string) => {
        dispatch({ type: 'UPDATE_HABIT_STATE', payload: { habitId, state, date } });
    }, []);
    const updateScheduleState = useCallback((blockId: string, state: DailyItemState, date?: string) => {
        dispatch({ type: 'UPDATE_SCHEDULE_STATE', payload: { blockId, state, date } });
    }, []);
    const updateDailyNotes = useCallback((notes: string, date?: string) => {
        dispatch({ type: 'UPDATE_DAILY_NOTES', payload: { notes, date } });
    }, []);
    const closeDay = useCallback((date?: string) => dispatch({ type: 'CLOSE_DAY', payload: { date } }), []);

    return (
        <ProfileContext.Provider
            value={{
                profile,
                dispatch,
                addSkill,
                removeSkill,
                addMission,
                completeMission,
                addXP,
                runDecayCheck,
                runMissionExpiry,
                addCategory,
                removeCategory,
                renameCategory,
                setSleepHours,
                updateHabitState,
                updateScheduleState,
                updateDailyNotes,
                closeDay,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile(): ProfileContextType {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used within a <ProfileProvider>');
    return ctx;
}

function completeMissionInState(state: UserProfile, missionId: string): UserProfile {
    const mission = state.missions.find((item) => item.id === missionId);
    if (!mission || mission.status !== 'active') return state;

    const isFirstGrind = !hasCompletedToday(state.missions);
    const xpGained = calculateMissionXP(mission, isFirstGrind);
    const completed = completeMissionFn(mission);

    const updatedSkills = state.skills.map((skill) => {
        if (skill.id !== mission.skillId) return skill;
        const newXP = skill.currentXP + xpGained;
        const rankInfo = getRankFromXP(newXP);
        return {
            ...skill,
            currentXP: newXP,
            rank: rankInfo.rank,
            subDivision: rankInfo.subDivision,
            lastTrainedAt: new Date().toISOString(),
        };
    });

    const sourceSkill = updatedSkills.find((skill) => skill.id === mission.skillId);
    const synergyResults = sourceSkill ? calculateSynergies(sourceSkill, xpGained, updatedSkills) : [];
    const synergySkills = updatedSkills.map((skill) => {
        const synergy = synergyResults.find((result) => result.skillId === skill.id);
        if (!synergy) return skill;
        const newXP = skill.currentXP + synergy.bonusXP;
        const rankInfo = getRankFromXP(newXP);
        return { ...skill, currentXP: newXP, rank: rankInfo.rank, subDivision: rankInfo.subDivision };
    });

    return {
        ...state,
        skills: synergySkills,
        missions: state.missions.map((item) => (item.id === missionId ? completed : item)),
        overallXP: state.overallXP + xpGained,
    };
}

function closeDayInState(state: UserProfile, date: string): UserProfile {
    const record = getDailyRecord(state, date);
    const blocks = getTodayBlocks(state, new Date(`${date}T12:00:00`));
    const { score, xp, tasksCompleted } = calculateDailyScore(record, state.habits, blocks);
    const habitsCompleted = state.habits.filter((habit) => record.habitStates[habit.id] === 'complete').length;
    const closureType = score >= 3 ? 'triumph' : 'patience';
    const updatedRecord: DailyRecord = {
        ...record,
        consistencyScore: score,
        xpGained: xp,
        closedAt: new Date().toISOString(),
    };

    const closure = {
        date,
        consistencyScore: score,
        habitsTotal: state.habits.length,
        habitsCompleted,
        sleepHours: record.sleepHours,
        closureType,
    } as const;

    const withDailyData: UserProfile = {
        ...state,
        dailyRecords: { ...state.dailyRecords, [date]: updatedRecord },
        dailyClosures: [...state.dailyClosures.filter((item) => item.date !== date), closure],
        activityLog: upsertActivity(state.activityLog, { date, xpGained: xp, tasksCompleted }),
    };

    return updateStreakForDate(withDailyData, date);
}

function updateStreakForDate(state: UserProfile, date: string): UserProfile {
    const closedDates = new Set(
        state.dailyClosures
            .filter((closure) => closure.consistencyScore > 0)
            .map((closure) => closure.date)
    );

    if (!closedDates.has(date)) return { ...state, currentStreak: 0 };

    let streak = 0;
    const cursor = new Date(`${date}T12:00:00`);
    while (closedDates.has(getLocalDateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return {
        ...state,
        currentStreak: streak,
        longestStreak: Math.max(state.longestStreak, streak),
    };
}

function upsertActivity(activityLog: ActivityEntry[], entry: ActivityEntry): ActivityEntry[] {
    return [...activityLog.filter((item) => item.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date));
}
