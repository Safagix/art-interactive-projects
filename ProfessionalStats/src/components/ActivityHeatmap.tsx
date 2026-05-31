// =============================================================================
// ActivityHeatmap — System 5: GitHub-style contribution graph
// =============================================================================

import { motion } from 'framer-motion';
import type { ActivityEntry } from '@/types';
import { getLocalDateKey } from '@/services/DateService';

interface ActivityHeatmapProps {
    activityLog: ActivityEntry[];
}

/** Generate the last 90 days as date strings. */
function getLast90Days(): string[] {
    const days: string[] = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(getLocalDateKey(d));
    }
    return days;
}

/** Map XP to an intensity level (0-4). */
function getIntensity(xp: number): number {
    if (xp === 0) return 0;
    if (xp < 50) return 1;
    if (xp < 150) return 2;
    if (xp < 300) return 3;
    return 4;
}

const INTENSITY_COLORS = [
    'rgba(255, 255, 255, 0.04)',  // 0: no activity
    'rgba(79, 195, 247, 0.2)',     // 1: light
    'rgba(79, 195, 247, 0.4)',     // 2: moderate
    'rgba(79, 195, 247, 0.65)',    // 3: high
    'rgba(79, 195, 247, 0.9)',     // 4: max
];

export function ActivityHeatmap({ activityLog }: ActivityHeatmapProps) {
    const days = getLast90Days();

    // Build a lookup map for quick access
    const logMap = new Map<string, ActivityEntry>();
    for (const entry of activityLog) {
        logMap.set(entry.date, entry);
    }

    return (
        <div className="glass-card p-5">
            <h3 className="section-title">Actividad (90 días)</h3>
            <div className="flex flex-wrap gap-[3px]">
                {days.map((day, i) => {
                    const entry = logMap.get(day);
                    const xp = entry?.xpGained ?? 0;
                    const intensity = getIntensity(xp);
                    const label = `${day}: ${xp} XP`;

                    return (
                        <motion.div
                            key={day}
                            className="w-[11px] h-[11px] rounded-[3px] cursor-pointer"
                            style={{ background: INTENSITY_COLORS[intensity] }}
                            title={label}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.003, duration: 0.2 }}
                            whileHover={{
                                scale: 1.8,
                                boxShadow: '0 0 8px rgba(79, 195, 247, 0.5)',
                            }}
                        />
                    );
                })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1 mt-3">
                <span className="text-[10px] mr-1" style={{ color: 'var(--color-text-muted)' }}>
                    Menos
                </span>
                {INTENSITY_COLORS.map((color, i) => (
                    <div
                        key={i}
                        className="w-[11px] h-[11px] rounded-[3px]"
                        style={{ background: color }}
                    />
                ))}
                <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    Más
                </span>
            </div>
        </div>
    );
}
