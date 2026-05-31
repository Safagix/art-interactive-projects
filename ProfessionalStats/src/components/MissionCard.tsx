// =============================================================================
// MissionCard — Displays a mission with completion action
// =============================================================================

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Zap, Target, Trophy } from 'lucide-react';
import type { Mission } from '@/types';
import { cn } from '@/utils/cn';

interface MissionCardProps {
    mission: Mission;
    isFirstGrind: boolean;
    onComplete: (missionId: string) => void;
}

const TYPE_CONFIG = {
    daily: { icon: Zap, label: 'Diaria', color: '#4FC3F7' },
    weekly: { icon: Target, label: 'Semanal', color: '#28C840' },
    monthly: { icon: Trophy, label: 'Épica', color: '#FFD700' },
};

export function MissionCard({ mission, isFirstGrind, onComplete }: MissionCardProps) {
    const config = TYPE_CONFIG[mission.type];
    const Icon = config.icon;
    const isCompleted = mission.status === 'completed';
    const isExpired = mission.status === 'expired';

    const effectiveXP = isFirstGrind && !isCompleted ? mission.xpReward * 2 : mission.xpReward;

    return (
        <motion.div
            className={cn(
                'glass-card p-4',
                isCompleted && 'opacity-50',
                isExpired && 'opacity-30'
            )}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isCompleted ? 0.5 : isExpired ? 0.3 : 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            <div className="flex items-center justify-between">
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${config.color}20`, color: config.color }}
                    >
                        <Icon size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {mission.title}
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {mission.description}
                        </p>
                    </div>
                </div>

                {/* Right: XP + Action */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-sm font-bold" style={{ color: config.color }}>
                            +{effectiveXP} XP
                        </div>
                        {isFirstGrind && !isCompleted && (
                            <div className="text-[10px] font-semibold" style={{ color: '#FFD700' }}>
                                2x FIRST GRIND
                            </div>
                        )}
                        <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                            {config.label}
                        </div>
                    </div>

                    {!isCompleted && !isExpired ? (
                        <button
                            className="glass-btn glass-btn-primary !p-2 !rounded-full"
                            onClick={() => onComplete(mission.id)}
                        >
                            <CheckCircle size={16} />
                        </button>
                    ) : isCompleted ? (
                        <CheckCircle size={18} style={{ color: '#28C840' }} />
                    ) : (
                        <Clock size={18} style={{ color: 'var(--color-text-muted)' }} />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
