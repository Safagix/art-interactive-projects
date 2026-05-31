// =============================================================================
// CreateSkillModal — Form to create a new skill
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Skill, StatCategory } from '@/types';
import { useProfile } from '@/context/ProfileContext';

interface CreateSkillModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (skill: Skill) => void;
}

const SKILL_ICONS = ['🧠', '💪', '💼', '💰', '🤝', '🎨', '📚', '🧘', '💻', '🎮', '🏃', '🎵', '📖', '🌐', '⚡', '🔧'];

export function CreateSkillModal({ visible, onClose, onSubmit }: CreateSkillModalProps) {
    const { profile } = useProfile();
    const [name, setName] = useState('');
    const [category, setCategory] = useState<StatCategory>(profile.categories[0] || '');
    const [icon, setIcon] = useState('⚛️');

    const handleSubmit = () => {
        if (!name.trim()) return;

        const skill: Skill = {
            id: crypto.randomUUID(),
            name: name.trim(),
            icon,
            category,
            currentXP: 0,
            rank: 'Iron',
            subDivision: 1,
            decayDays: 5,
            lastTrainedAt: new Date().toISOString(),
            synergies: [],
            createdAt: new Date().toISOString(),
        };

        onSubmit(skill);
        setName('');
        setCategory(profile.categories[0] || '');
        setIcon('⚛️');
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
                                Nueva Habilidad
                            </h2>
                            <button className="glass-btn !p-1.5 !rounded-full" onClick={onClose}>
                                <X size={14} />
                            </button>
                        </div>

                        {/* Name */}
                        <div className="mb-4">
                            <label className="section-title">Nombre</label>
                            <input
                                className="glass-input"
                                placeholder="Ej: React, English, Python..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <label className="section-title">Categoría</label>
                            {profile.categories.length === 0 ? (
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    No hay categorías. Ve a Configuración para añadir una.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.categories.map((cat) => (
                                        <button
                                            key={cat}
                                            className={`glass-btn text-xs ${category === cat ? 'glass-btn-primary' : ''}`}
                                            onClick={() => setCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Icon */}
                        <div className="mb-5">
                            <label className="section-title">Ícono</label>
                            <div className="flex flex-wrap gap-2">
                                {SKILL_ICONS.map((ic) => (
                                    <button
                                        key={ic}
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${icon === ic
                                            ? 'ring-2 ring-[#4FC3F7] bg-[rgba(79,195,247,0.15)]'
                                            : 'bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)]'
                                            }`}
                                        onClick={() => setIcon(ic)}
                                    >
                                        {ic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            className="glass-btn glass-btn-primary w-full justify-center font-semibold"
                            onClick={handleSubmit}
                        >
                            Crear Habilidad
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
