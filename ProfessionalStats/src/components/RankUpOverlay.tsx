// =============================================================================
// RankUpOverlay — Full-screen celebration animation on rank-up
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { RANK_COLORS, getRankLabel } from '@/services/RankEngine';
import type { RankName, SubDivision } from '@/types';

interface RankUpOverlayProps {
    visible: boolean;
    newRank: RankName;
    newSub: SubDivision;
    skillName: string;
    onDismiss: () => void;
}

export function RankUpOverlay({ visible, newRank, newSub, skillName, onDismiss }: RankUpOverlayProps) {
    const color = RANK_COLORS[newRank];

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer"
                    onClick={onDismiss}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(12px)' }}
                >
                    {/* Radial glow behind badge */}
                    <motion.div
                        className="absolute rounded-full"
                        style={{
                            width: 300,
                            height: 300,
                            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.5] }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />

                    {/* Center content */}
                    <div className="relative text-center z-10">
                        {/* "RANK UP" text */}
                        <motion.div
                            className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
                            style={{ color: 'rgba(224, 247, 250, 0.5)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            RANK UP
                        </motion.div>

                        {/* Rank Badge */}
                        <motion.div
                            className="text-5xl font-black tracking-tight mb-2"
                            style={{ color }}
                            initial={{ opacity: 0, scale: 0.3 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 12 }}
                        >
                            {getRankLabel(newRank, newSub)}
                        </motion.div>

                        {/* Skill name */}
                        <motion.div
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            {skillName}
                        </motion.div>

                        {/* Dismiss hint */}
                        <motion.div
                            className="text-xs mt-8"
                            style={{ color: 'var(--color-text-muted)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.5, 1] }}
                            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                        >
                            Click to continue
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
