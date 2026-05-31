// =============================================================================
// StatsRadar — System 5: Radar Chart for dynamic stat categories
// =============================================================================

import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { useProfile } from '@/context/ProfileContext';
import { CORE_PILLARS, PILLAR_DESCRIPTIONS, getPillarScore, getPillarXP } from '@/services/StatsTaxonomyService';

export function StatsRadar() {
    const { profile } = useProfile();

    const data = CORE_PILLARS.map((pillar) => ({
        category: pillar,
        score: getPillarScore(profile.skills, pillar),
        xp: getPillarXP(profile.skills, pillar),
        description: PILLAR_DESCRIPTIONS[pillar],
    }));

    return (
        <div className="glass-card p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="section-title mb-0">Distribución de Stats</h3>
            </div>
            {profile.skills.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Crea habilidades para ver tus pilares
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={data} cx="50%" cy="50%" outerRadius="58%">
                        <PolarGrid
                            stroke="rgba(79, 195, 247, 0.15)"
                            strokeDasharray="3 3"
                        />
                        <PolarAngleAxis
                            dataKey="category"
                            tick={{ fill: 'rgba(224, 247, 250, 0.72)', fontSize: 11, fontWeight: 700 }}
                        />
                        <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#4FC3F7"
                            fill="#4FC3F7"
                            fillOpacity={0.2}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15, 23, 42, 0.9)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                color: '#F0F9FF',
                                fontSize: '12px',
                                backdropFilter: 'blur(10px)',
                            }}
                            formatter={(value, name, item) => {
                                const payload = item.payload as { xp: number };
                                return [`${Number(value)} / 100 · ${payload.xp.toLocaleString()} XP`, 'Score'];
                            }}
                            labelFormatter={(label) => `${label}: ${PILLAR_DESCRIPTIONS[label as keyof typeof PILLAR_DESCRIPTIONS]}`}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
