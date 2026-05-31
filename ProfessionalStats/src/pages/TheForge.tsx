// =============================================================================
// TheForge — Habit Management & Daily Task Execution
// =============================================================================
// Central hub for creating, tracking, and completing habits with granular
// 4-state progress. Integrates Spotlight Mode and Celebration Engine.
// =============================================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, X, Calendar } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { HabitItem } from '@/components/HabitItem';
import { SpotlightMode } from '@/components/SpotlightMode';
import { CelebrationHoldBtn } from '@/components/CelebrationHoldBtn';
import { rollCelebrationDice, isEpicRoll, getCelebrationMessage, calculateSoulGems } from '@/services/CelebrationEngine';
import { getPrompt } from '@/services/PromptEngine';
import { getLocalDateKey } from '@/services/DateService';
import { getDailyRecord } from '@/services/DailyPlanService';
import type { Habit, HabitCompletionState } from '@/types';

export function TheForge() {
    const { profile, dispatch, updateHabitState } = useProfile();
    const habits = profile.habits || [];
    const today = getLocalDateKey();
    const todayRecord = getDailyRecord(profile, today);

    const [isCreating, setIsCreating] = useState(false);
    const [spotlightHabit, setSpotlightHabit] = useState<Habit | null>(null);
    const [celebrationData, setCelebrationData] = useState<{
        roll: number; message: string; habitName: string;
    } | null>(null);

    // New habit form state
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('📌');
    const [newCategory, setNewCategory] = useState('');
    const [newEffort, setNewEffort] = useState(5);
    const [newMotivation, setNewMotivation] = useState(5);
    const [newTags, setNewTags] = useState('');

    const createHabit = useCallback(() => {
        if (!newName.trim()) return;
        const habit: Habit = {
            id: crypto.randomUUID(),
            name: newName.trim(),
            icon: newIcon,
            category: newCategory || 'General',
            effortLevel: newEffort,
            baseMotivation: newMotivation,
            visionBoardTags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
            completionState: 'null',
            isDaily: true,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'SET_PROFILE', payload: { habits: [...habits, habit] } });
        setNewName(''); setNewIcon('📌'); setNewCategory('');
        setNewEffort(5); setNewMotivation(5); setNewTags('');
        setIsCreating(false);
    }, [newName, newIcon, newCategory, newEffort, newMotivation, newTags, habits, dispatch]);

    const handleStateChange = useCallback((habitId: string, state: HabitCompletionState) => {
        updateHabitState(habitId, state, today);

        // If marked as complete, trigger celebration engine
        if (state === 'complete') {
            const habit = habits.find((h) => h.id === habitId);
            const roll = rollCelebrationDice();

            if (isEpicRoll(roll) && habit) {
                const message = getCelebrationMessage(roll);
                setCelebrationData({ roll, message, habitName: habit.name });
            }

            // Award soul gems
            const gems = calculateSoulGems(roll);
            dispatch({
                type: 'SET_PROFILE',
                payload: { soulGems: (profile.soulGems || 0) + gems },
            });
        }
    }, [habits, profile.soulGems, dispatch, today, updateHabitState]);

    const completedCount = habits.filter((h) => todayRecord.habitStates[h.id] === 'complete').length;
    const totalCount = habits.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="page-content">
            {/* Header */}
            <div className="forge-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>⚒️ La Forja</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        Gestiona tus hábitos diarios y semanales
                    </p>
                </div>
                <button className="glass-btn glass-btn-primary" onClick={() => setIsCreating(true)}>
                    <Plus size={16} /> Nuevo Hábito
                </button>
            </div>

            {/* Progress Bar */}
            <div className="forge-progress glass-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <Target size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Progreso del Día
                    </span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem' }}>
                        {completedCount}/{totalCount} — {progressPct}%
                    </span>
                </div>
                <div className="xp-bar-container">
                    <motion.div
                        className="xp-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.6 }}
                    />
                </div>
            </div>

            {/* Habits List */}
            <div className="forge-habits-list">
                {habits.length === 0 ? (
                    <motion.div
                        className="glass-card"
                        style={{ padding: '40px', textAlign: 'center' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Calendar size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            No tienes hábitos aún. Crea uno para empezar a forjar tu progreso.
                        </p>
                    </motion.div>
                ) : (
                    habits.map((habit, i) => {
                        const dailyState = todayRecord.habitStates[habit.id] ?? 'null';
                        const habitForToday = { ...habit, completionState: dailyState };
                        const prompt = getPrompt(habit.effortLevel, habit.baseMotivation);
                        return (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <HabitItem
                                    habit={habitForToday}
                                    onStateChange={handleStateChange}
                                    onSpotlight={setSpotlightHabit}
                                    promptType={dailyState === 'null' ? prompt.type : undefined}
                                    promptMessage={dailyState === 'null' ? prompt.message : undefined}
                                />
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Create Habit Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                <h2 style={{ fontSize: '1.1rem' }}>Nuevo Hábito</h2>
                                <button className="glass-btn" onClick={() => setIsCreating(false)}>
                                    <X size={16} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <input className="glass-input" placeholder="Nombre del hábito"
                                    value={newName} onChange={(e) => setNewName(e.target.value)} />

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input className="glass-input" placeholder="Icono (emoji)" style={{ maxWidth: 80 }}
                                        value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
                                    <input className="glass-input" placeholder="Categoría"
                                        value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        Nivel de Esfuerzo: {newEffort}/10
                                    </label>
                                    <input type="range" min={1} max={10} value={newEffort}
                                        onChange={(e) => setNewEffort(parseInt(e.target.value))}
                                        style={{ width: '100%' }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        Motivación Base: {newMotivation}/10
                                    </label>
                                    <input type="range" min={1} max={10} value={newMotivation}
                                        onChange={(e) => setNewMotivation(parseInt(e.target.value))}
                                        style={{ width: '100%' }} />
                                </div>

                                <input className="glass-input" placeholder="Tags (separados por coma)"
                                    value={newTags} onChange={(e) => setNewTags(e.target.value)} />

                                <button className="glass-btn glass-btn-primary" onClick={createHabit}
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                                    <Plus size={16} /> Crear Hábito
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spotlight Mode */}
            {spotlightHabit && (
                <SpotlightMode
                    habitName={spotlightHabit.name}
                    habitIcon={spotlightHabit.icon}
                    isOpen={!!spotlightHabit}
                    onClose={() => setSpotlightHabit(null)}
                />
            )}

            {/* Epic Celebration Overlay */}
            <AnimatePresence>
                {celebrationData && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="celebration-overlay-content"
                            initial={{ scale: 0.7 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.3rem', color: '#FFD700', marginBottom: 12 }}>
                                ¡ÉPICO! — Roll {celebrationData.roll}/10
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, maxWidth: 350, lineHeight: 1.6 }}>
                                {celebrationData.message}
                            </p>
                            <CelebrationHoldBtn onComplete={() => setCelebrationData(null)} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
