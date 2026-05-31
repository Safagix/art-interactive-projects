// =============================================================================
// TheChronicle — Statistics, Heatmap, Vision Board & History
// =============================================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, Trophy, Eye } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { getLocalDateKey } from '@/services/DateService';

export function TheChronicle() {
    const { profile } = useProfile();
    const closures = profile.dailyClosures || [];
    const celebrations = profile.celebrations || [];
    const visionProgress = profile.visionBoardProgress || {};

    // Generate heatmap data for last 90 days
    const heatmapData = useMemo(() => {
        const days: { date: string; score: number }[] = [];
        const today = new Date();
        for (let i = 89; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = getLocalDateKey(d);
            const closure = closures.find((c) => c.date === dateStr);
            days.push({ date: dateStr, score: closure?.consistencyScore || 0 });
        }
        return days;
    }, [closures]);

    // Category distribution from habits
    const categoryDistribution = useMemo(() => {
        const habits = profile.habits || [];
        const cats: Record<string, number> = {};
        habits.forEach((h) => {
            cats[h.category] = (cats[h.category] || 0) + 1;
        });
        return Object.entries(cats).map(([name, count]) => ({ name, count }));
    }, [profile.habits]);

    const totalCelebrations = celebrations.length;
    const epicCelebrations = celebrations.filter((c) => c.isEpic).length;

    const getHeatColor = (score: number) => {
        if (score === 0) return 'rgba(255,255,255,0.04)';
        if (score === 1) return 'rgba(79,195,247,0.15)';
        if (score === 2) return 'rgba(79,195,247,0.35)';
        if (score === 3) return 'rgba(79,195,247,0.55)';
        return 'rgba(79,195,247,0.85)';
    };

    return (
        <div className="page-content">
            <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }}>📜 La Crónica</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
                Estadísticas, constancia y logros
            </p>

            {/* Stats Summary */}
            <div className="chronicle-stats-row">
                {[
                    { label: 'Racha Actual', value: profile.currentStreak, icon: '🔥' },
                    { label: 'Racha Máxima', value: profile.longestStreak, icon: '⭐' },
                    { label: 'Celebraciones', value: totalCelebrations, icon: '🎉' },
                    { label: 'Épicas (8-10)', value: epicCelebrations, icon: '💎' },
                    { label: 'Gemas de Alma', value: profile.soulGems || 0, icon: '💠' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="glass-card chronicle-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <span className="chronicle-stat-icon">{stat.icon}</span>
                        <span className="chronicle-stat-value">{stat.value}</span>
                        <span className="chronicle-stat-label">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Heatmap */}
            <motion.div
                className="glass-card"
                style={{ padding: 20, marginBottom: 24 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="section-title">
                    <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Mapa de Calor de Constancia (90 días)
                </h3>
                <div className="chronicle-heatmap">
                    {heatmapData.map((day) => (
                        <div
                            key={day.date}
                            className="chronicle-heat-cell"
                            style={{ background: getHeatColor(day.score) }}
                            title={`${day.date}: Score ${day.score}`}
                        />
                    ))}
                </div>
                <div className="chronicle-heat-legend">
                    <span>Menos</span>
                    {[0, 1, 2, 3, 4].map((s) => (
                        <div key={s} className="chronicle-heat-cell" style={{ background: getHeatColor(s) }} />
                    ))}
                    <span>Más</span>
                </div>
            </motion.div>

            {/* Category Distribution */}
            <motion.div
                className="glass-card"
                style={{ padding: 20, marginBottom: 24 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="section-title">
                    <BarChart3 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Análisis de Enfoque por Categoría
                </h3>
                {categoryDistribution.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        Crea hábitos en La Forja para ver la distribución.
                    </p>
                ) : (
                    <div className="chronicle-category-bars">
                        {categoryDistribution.map((cat) => (
                            <div key={cat.name} className="chronicle-cat-row">
                                <span className="chronicle-cat-name">{cat.name}</span>
                                <div className="chronicle-cat-bar-bg">
                                    <motion.div
                                        className="chronicle-cat-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${(cat.count / Math.max(...categoryDistribution.map((c) => c.count))) * 100}%`,
                                        }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    />
                                </div>
                                <span className="chronicle-cat-count">{cat.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Vision Board Progress */}
            <motion.div
                className="glass-card"
                style={{ padding: 20 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <h3 className="section-title">
                    <Eye size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Vision Board — Progreso por Tags
                </h3>
                {Object.keys(visionProgress).length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        Completa hábitos con tags para revelar tu visión a largo plazo.
                    </p>
                ) : (
                    <div className="chronicle-vision-tags">
                        {Object.entries(visionProgress).map(([tag, pct]) => (
                            <div key={tag} className="chronicle-vision-tag">
                                <span>{tag}</span>
                                <div className="xp-bar-container">
                                    <motion.div
                                        className="xp-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        transition={{ duration: 0.6 }}
                                    />
                                </div>
                                <span style={{ fontFamily: "'Space Mono'", fontSize: '0.75rem' }}>{pct}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
