// =============================================================================
// ProfileHeader — Top bar with overall level, title, streak, and XP
// =============================================================================

import { motion } from 'framer-motion';
import { Flame, Trophy, Star } from 'lucide-react';
import type { UserProfile } from '@/types';

interface ProfileHeaderProps {
    profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <div className="glass-card p-5 mb-5">
            <div className="flex items-center justify-between">
                {/* Left: Level + Title */}
                <div className="flex items-center gap-4">
                    {/* Level circle */}
                    <motion.div
                        className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg relative"
                        style={{
                            background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.3), rgba(2, 119, 189, 0.3))',
                            border: '2px solid rgba(79, 195, 247, 0.5)',
                            color: '#4FC3F7',
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        {profile.totalLevel}
                        {/* Glossy reflection */}
                        <div
                            className="absolute top-0 left-0 w-full h-1/2 rounded-t-full"
                            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)' }}
                        />
                    </motion.div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            Nivel {profile.totalLevel}
                        </h1>
                        <p className="text-xs font-medium" style={{ color: 'var(--color-aero-blue)' }}>
                            {profile.title}
                        </p>
                    </div>
                </div>

                {/* Right: Stats chips */}
                <div className="flex items-center gap-4">
                    {/* XP */}
                    <div className="flex items-center gap-1.5">
                        <Star size={14} style={{ color: '#FFD700' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {profile.overallXP.toLocaleString()}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>XP</span>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5">
                        <Flame size={14} style={{ color: '#FF6D3A' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {profile.currentStreak}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>racha</span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5">
                        <Trophy size={14} style={{ color: '#CD7F32' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {profile.badges.length}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>logros</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
