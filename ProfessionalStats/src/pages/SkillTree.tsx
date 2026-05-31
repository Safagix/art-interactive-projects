// =============================================================================
// SkillTree — Interactive visual node graph with synergy connections
// =============================================================================

import { motion } from 'framer-motion';
import { Lock, Unlock, Zap, Link2 } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { getRankFromXP, RANK_COLORS, getRankLabel, getRankIndex } from '@/services/RankEngine';
import { getPassiveMultiplier } from '@/services/SynergyEngine';

export function SkillTree() {
    const { profile } = useProfile();

    return (
        <div className="page-content">
            <h2 className="section-title flex items-center gap-2 mb-4">
                <Zap size={14} /> Árbol de Habilidades
            </h2>

            {profile.skills.length === 0 ? (
                <div className="glass-card p-8 text-center">
                    <Lock size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Agrega habilidades desde el Dashboard para desbloquear el Skill Tree
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Skill Nodes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profile.skills.map((skill, i) => {
                            const info = getRankFromXP(skill.currentXP);
                            const color = RANK_COLORS[info.rank];
                            const isAdvanced = getRankIndex(info.rank) >= 3; // Gold+
                            const multiplier = getPassiveMultiplier(skill.id, profile.skills);
                            const hasSynergies = skill.synergies.length > 0;

                            return (
                                <motion.div
                                    key={skill.id}
                                    className="glass-card p-5 cursor-pointer relative overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 250, damping: 20 }}
                                    whileHover={{ scale: 1.03 }}
                                >
                                    {/* Glow for advanced ranks */}
                                    {isAdvanced && (
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: `radial-gradient(ellipse at top right, ${color}12 0%, transparent 60%)`,
                                            }}
                                        />
                                    )}

                                    <div className="relative z-10">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {isAdvanced ? (
                                                    <Unlock size={16} style={{ color }} />
                                                ) : (
                                                    <Lock size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                )}
                                                <h3 className="text-sm font-semibold">{skill.name}</h3>
                                            </div>
                                            <div
                                                className="rank-badge"
                                                style={{
                                                    background: `${color}20`,
                                                    borderColor: `${color}60`,
                                                    color,
                                                }}
                                            >
                                                {getRankLabel(info.rank, info.subDivision)}
                                            </div>
                                        </div>

                                        {/* XP Bar */}
                                        <div className="xp-bar-container mb-3">
                                            <motion.div
                                                className="xp-bar-fill"
                                                style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${info.progressPercent}%` }}
                                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            />
                                        </div>

                                        {/* Multiplier */}
                                        {multiplier > 1 && (
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Zap size={12} style={{ color: '#FFD700' }} />
                                                <span className="text-xs font-semibold" style={{ color: '#FFD700' }}>
                                                    x{multiplier.toFixed(2)} Multiplicador Pasivo
                                                </span>
                                            </div>
                                        )}

                                        {/* Synergy connections */}
                                        {hasSynergies && (
                                            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-glass-border)' }}>
                                                <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                                    Sinergias
                                                </p>
                                                {skill.synergies.map((syn, si) => {
                                                    const target = profile.skills.find(s => s.id === syn.targetSkillId);
                                                    return (
                                                        <div key={si} className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                                            <Link2 size={10} />
                                                            <span>{target?.name || 'Unknown'}: +{Math.round(syn.multiplier * 100)}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
