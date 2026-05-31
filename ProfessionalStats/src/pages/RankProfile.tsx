// =============================================================================
// RankProfile — The "flex page" showing overall rank and all skill ranks
// =============================================================================

import { motion } from 'framer-motion';
import { Shield, TrendingUp, Award } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { getRankFromXP, RANK_COLORS, getRankLabel, RANKS } from '@/services/RankEngine';
import { calculateDecay } from '@/services/DecayEngine';
import type { RankName } from '@/types';

/** Get the "dominant" rank — the highest rank among all skills. */
function getDominantRank(skills: { currentXP: number }[]): { rank: RankName; sub: 1 | 2 | 3 } {
    if (skills.length === 0) return { rank: 'Iron', sub: 1 };
    let best = getRankFromXP(0);
    for (const s of skills) {
        const info = getRankFromXP(s.currentXP);
        const idx = RANKS.indexOf(info.rank) * 3 + info.subDivision;
        const bestIdx = RANKS.indexOf(best.rank) * 3 + best.subDivision;
        if (idx > bestIdx) best = info;
    }
    return { rank: best.rank, sub: best.subDivision };
}

export function RankProfile() {
    const { profile } = useProfile();
    const dominant = getDominantRank(profile.skills);
    const dominantColor = RANK_COLORS[dominant.rank];

    return (
        <div className="page-content">
            {/* Hero — Overall Rank Display */}
            <motion.div
                className="glass-card p-8 mb-6 text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Glow behind rank */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at center, ${dominantColor}15 0%, transparent 65%)`,
                    }}
                />

                <div className="relative z-10">
                    <p className="section-title mb-4">Tu Rango Dominante</p>
                    <motion.div
                        className="text-6xl font-heading font-bold mb-2"
                        style={{ color: dominantColor }}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    >
                        {getRankLabel(dominant.rank, dominant.sub)}
                    </motion.div>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5">
                            <Shield size={14} style={{ color: 'var(--color-text-secondary)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                Nivel {profile.totalLevel}
                            </span>
                        </div>
                        <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} style={{ color: 'var(--color-text-secondary)' }} />
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {profile.overallXP.toLocaleString()} XP Total
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Skills Rank Grid */}
            <h2 className="section-title flex items-center gap-2 mb-4">
                <Award size={14} /> Rangos por Habilidad
            </h2>

            {profile.skills.length === 0 ? (
                <div className="glass-card p-6 text-center">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Agrega habilidades desde el Dashboard para ver tus rangos
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.skills.map((skill, i) => {
                        const info = getRankFromXP(skill.currentXP);
                        const color = RANK_COLORS[info.rank];
                        const decay = calculateDecay(skill);

                        return (
                            <motion.div
                                key={skill.id}
                                className={`glass-card p-5 decay-${decay.state}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold">{skill.name}</h3>
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
                                <div className="xp-bar-container mb-2">
                                    <motion.div
                                        className="xp-bar-fill"
                                        style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${info.progressPercent}%` }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 + 0.3 }}
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        {info.xpInCurrentSub.toLocaleString()} / {info.xpForCurrentSub.toLocaleString()} XP
                                    </span>
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                        {skill.category}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
