// =============================================================================
// CreateMissionModal — Form to create a new mission / bounty
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Skill, MissionType } from '@/types';
import { createMission, XP_PRESETS } from '@/services/MissionEngine';

interface CreateMissionModalProps {
    visible: boolean;
    skills: Skill[];
    onClose: () => void;
    onSubmit: (mission: ReturnType<typeof createMission>) => void;
}

const MISSION_TYPES: { value: MissionType; label: string; emoji: string }[] = [
    { value: 'daily', label: 'Diaria', emoji: '⚡' },
    { value: 'weekly', label: 'Semanal', emoji: '🎯' },
    { value: 'monthly', label: 'Épica', emoji: '🏆' },
];

export function CreateMissionModal({ visible, skills, onClose, onSubmit }: CreateMissionModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<MissionType>('daily');
    const [skillId, setSkillId] = useState(skills[0]?.id || '');
    const [baseXp, setBaseXp] = useState(XP_PRESETS.daily.default);

    // Realism stats
    const [difficulty, setDifficulty] = useState<number>(1); // Multipliers: 0.8, 1, 1.5, 2
    const [duration, setDuration] = useState<number>(30); // Minutes: 15, 30, 60, 120

    const calculatedXp = Math.round(baseXp * difficulty * (duration / 30));

    const handleTypeChange = (newType: MissionType) => {
        setType(newType);
        setBaseXp(XP_PRESETS[newType].default);
    };

    const handleSubmit = () => {
        if (!title.trim() || !skillId) return;
        const mission = createMission(title.trim(), description.trim(), calculatedXp, type, skillId);
        onSubmit(mission);
        setTitle('');
        setDescription('');
        setType('daily');
        setBaseXp(XP_PRESETS.daily.default);
        setDifficulty(1);
        setDuration(30);
        onClose();
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                Nueva Misión
                            </h2>
                            <button className="glass-btn !p-1.5 !rounded-full" onClick={onClose}>
                                <X size={14} />
                            </button>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="section-title">Título</label>
                            <input
                                className="glass-input"
                                placeholder="Ej: Completar 1 lección de Japonés"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="section-title">Descripción</label>
                            <input
                                className="glass-input"
                                placeholder="Detalles opcionales..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Type */}
                        <div className="mb-4">
                            <label className="section-title">Tipo</label>
                            <div className="flex gap-2">
                                {MISSION_TYPES.map((mt) => (
                                    <button
                                        key={mt.value}
                                        className={`glass-btn text-xs flex-1 justify-center ${type === mt.value ? 'glass-btn-primary' : ''}`}
                                        onClick={() => handleTypeChange(mt.value)}
                                    >
                                        {mt.emoji} {mt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Skill target */}
                        <div className="mb-4">
                            <label className="section-title">Habilidad objetivo</label>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((s) => (
                                    <button
                                        key={s.id}
                                        className={`glass-btn text-xs ${skillId === s.id ? 'glass-btn-primary' : ''}`}
                                        onClick={() => setSkillId(s.id)}
                                    >
                                        {s.icon} {s.name}
                                    </button>
                                ))}
                            </div>
                            {skills.length === 0 && (
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                    Crea una habilidad primero
                                </p>
                            )}
                        </div>

                        {/* Difficulty */}
                        <div className="mb-4">
                            <label className="section-title">Dificultad</label>
                            <div className="flex gap-2">
                                {[
                                    { label: 'Fácil', mult: 0.8, color: '#4ADE80' },
                                    { label: 'Normal', mult: 1, color: '#4FC3F7' },
                                    { label: 'Difícil', mult: 1.5, color: '#FBBF24' },
                                    { label: 'Experto', mult: 2, color: '#FF4655' },
                                ].map((diff) => (
                                    <button
                                        key={diff.label}
                                        className={`glass-btn text-xs flex-1 justify-center ${difficulty === diff.mult ? 'bg-[rgba(255,255,255,0.08)] ring-1 ring-inset' : ''}`}
                                        style={{ '--tw-ring-color': diff.color } as React.CSSProperties}
                                        onClick={() => setDifficulty(diff.mult)}
                                    >
                                        {diff.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Estimated Time */}
                        <div className="mb-4">
                            <label className="section-title flex justify-between">
                                <span>Tiempo Estimado</span>
                                <span style={{ color: 'var(--color-aero-blue)' }}>{duration} min</span>
                            </label>
                            <input
                                type="range"
                                min={15}
                                max={120}
                                step={15}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full accent-[#4FC3F7]"
                            />
                            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                <span>15m</span>
                                <span>30m</span>
                                <span>1h</span>
                                <span>2h+</span>
                            </div>
                        </div>

                        {/* XP Result */}
                        <div className="mb-5 p-3 rounded-lg flex justify-between items-center" style={{ background: 'rgba(79, 195, 247, 0.05)', border: '1px solid rgba(79, 195, 247, 0.2)' }}>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Recompensa Total</span>
                                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Basado en esfuerzo y tiempo</span>
                            </div>
                            <span className="text-xl font-bold font-heading" style={{ color: 'var(--color-aero-blue)' }}>
                                +{calculatedXp} XP
                            </span>
                        </div>

                        {/* Submit */}
                        <button
                            className="glass-btn glass-btn-primary w-full justify-center font-semibold"
                            onClick={handleSubmit}
                            disabled={skills.length === 0}
                        >
                            Crear Misión
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
