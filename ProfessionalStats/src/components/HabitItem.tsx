// =============================================================================
// HabitItem — 4-State Granular Habit Tracker
// =============================================================================
// Interactive slider with visual states: Complete, Partial, Almost Null, Null.
// Triggers spotlight mode and celebration engine on completion.
// =============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Focus, Zap, Feather } from 'lucide-react';
import type { Habit, HabitCompletionState } from '@/types';

interface HabitItemProps {
    habit: Habit;
    onStateChange: (id: string, state: HabitCompletionState) => void;
    onSpotlight: (habit: Habit) => void;
    promptType?: 'spark' | 'facilitator';
    promptMessage?: string;
}

const STATES: { value: HabitCompletionState; label: string; color: string; emoji: string }[] = [
    { value: 'null', label: 'Nulo', color: 'rgba(255,70,85,0.3)', emoji: '⬛' },
    { value: 'almost_null', label: 'Casi Nulo', color: 'rgba(255,165,0,0.3)', emoji: '🟧' },
    { value: 'partial', label: 'Parcial', color: 'rgba(79,195,247,0.3)', emoji: '🟦' },
    { value: 'complete', label: 'Completo', color: 'rgba(40,200,64,0.4)', emoji: '🟩' },
];

export function HabitItem({ habit, onStateChange, onSpotlight, promptType, promptMessage }: HabitItemProps) {
    const currentIndex = STATES.findIndex((s) => s.value === habit.completionState);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <motion.div
            className="habit-item glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -2 }}
        >
            <div className="habit-item-header">
                <span className="habit-item-icon">{habit.icon}</span>
                <div className="habit-item-info">
                    <h4 className="habit-item-name">{habit.name}</h4>
                    <div className="habit-item-meta">
                        <span className="habit-effort">
                            Esfuerzo: {habit.effortLevel}/10
                        </span>
                        <span className="habit-motivation">
                            Motivación: {habit.baseMotivation}/10
                        </span>
                    </div>
                </div>

                {/* Spotlight button */}
                <button
                    className="glass-btn habit-spotlight-btn"
                    onClick={() => onSpotlight(habit)}
                    title="Modo Spotlight"
                >
                    <Focus size={16} />
                </button>
            </div>

            {/* Prompt hint (Spark or Facilitator) */}
            {promptMessage && (
                <motion.div
                    className={`habit-prompt ${promptType === 'spark' ? 'spark' : 'facilitator'}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                >
                    {promptType === 'spark' ? <Zap size={14} /> : <Feather size={14} />}
                    <span>{promptMessage}</span>
                </motion.div>
            )}

            {/* 4-State Selector */}
            <div className="habit-state-selector">
                {STATES.map((state, i) => (
                    <button
                        key={state.value}
                        className={`habit-state-btn ${i === currentIndex ? 'active' : ''} ${i === hoveredIndex ? 'hovered' : ''}`}
                        style={{
                            background: i === currentIndex ? state.color : undefined,
                        }}
                        onClick={() => onStateChange(habit.id, state.value)}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="habit-state-emoji">{state.emoji}</span>
                        <span className="habit-state-label">{state.label}</span>
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
