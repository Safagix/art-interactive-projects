// =============================================================================
// SkillCard — Displays a single skill with rank, XP bar, and decay state
// =============================================================================

import { motion } from 'framer-motion';
import { getRankFromXP, RANK_COLORS, getRankLabel } from '@/services/RankEngine';
import { calculateDecay } from '@/services/DecayEngine';
import type { Skill } from '@/types';
import { cn } from '@/utils/cn';

interface SkillCardProps {
    skill: Skill;
    onClick?: () => void;
}

export function SkillCard({ skill, onClick }: SkillCardProps) {
    const rankInfo = getRankFromXP(skill.currentXP);
    const decay = calculateDecay(skill);
    const rankColor = RANK_COLORS[rankInfo.rank];

    return (
        <motion.div
            className={cn('glass-card p-4 cursor-pointer', `decay-${decay.state}`)}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            {/* Header: Icon + Name + Rank Badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-xl">{skill.icon}</span>
                    <div>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {skill.name}
                        </h3>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {skill.category}
                        </span>
                    </div>
                </div>

                {/* Rank Badge */}
                <div
                    className="rank-badge"
                    style={{
                        background: `${rankColor}20`,
                        borderColor: `${rankColor}60`,
                        color: rankColor,
                    }}
                >
                    {getRankLabel(rankInfo.rank, rankInfo.subDivision)}
                </div>
            </div>

            {/* XP Bar */}
            <div className="xp-bar-container">
                <motion.div
                    className="xp-bar-fill"
                    style={{ background: `linear-gradient(90deg, ${rankColor}80, ${rankColor})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${rankInfo.progressPercent}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>

            {/* XP Label */}
            <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {rankInfo.xpInCurrentSub.toLocaleString()} / {rankInfo.xpForCurrentSub.toLocaleString()} XP
                </span>
                <span className="text-xs font-medium" style={{ color: rankColor }}>
                    {rankInfo.progressPercent}%
                </span>
            </div>

            {/* Decay Warning */}
            {decay.state !== 'fresh' && (
                <motion.div
                    className="mt-2 flex items-center gap-1.5 text-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: decay.state === 'decayed' ? '#FF4655' : '#ffbd44' }}
                >
                    <span>⚠</span>
                    <span>
                        {decay.state === 'decayed'
                            ? `Decayed — ${decay.daysInactive} days inactive`
                            : decay.state === 'rusting'
                                ? `Rusting — ${decay.daysInactive} days inactive`
                                : `Getting stale — ${decay.daysInactive} days`}
                    </span>
                </motion.div>
            )}
        </motion.div>
    );
}
