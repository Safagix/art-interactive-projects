// =============================================================================
// BountyBoard — Expanded missions page with type grouping
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Plus, Zap, Target, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { hasCompletedToday } from '@/services/MissionEngine';
import { detectRankUp } from '@/services/RankEngine';
import { MissionCard } from '@/components/MissionCard';
import { CreateMissionModal } from '@/components/CreateMissionModal';
import { RankUpOverlay } from '@/components/RankUpOverlay';
import type { RankName, SubDivision, MissionType } from '@/types';

const TYPE_TABS: { id: MissionType | 'all'; label: string; icon: typeof Zap }[] = [
    { id: 'all', label: 'Todas', icon: Swords },
    { id: 'daily', label: 'Diarias', icon: Zap },
    { id: 'weekly', label: 'Semanales', icon: Target },
    { id: 'monthly', label: 'Épicas', icon: Trophy },
];

export function BountyBoard() {
    const { profile, completeMission } = useProfile();
    const [activeTab, setActiveTab] = useState<MissionType | 'all'>('all');
    const [showCreate, setShowCreate] = useState(false);
    const [rankUpData, setRankUpData] = useState<{
        visible: boolean;
        rank: RankName;
        sub: SubDivision;
        skillName: string;
    }>({ visible: false, rank: 'Iron', sub: 1, skillName: '' });

    const isFirstGrind = !hasCompletedToday(profile.missions);

    const filteredMissions = profile.missions.filter((m) => {
        if (activeTab === 'all') return true;
        return m.type === activeTab;
    });

    const activeMissions = filteredMissions.filter(m => m.status === 'active');
    const completedMissions = filteredMissions.filter(m => m.status === 'completed');
    const expiredMissions = filteredMissions.filter(m => m.status === 'expired');

    const handleComplete = (missionId: string) => {
        const mission = profile.missions.find(m => m.id === missionId);
        if (!mission) return;

        const skill = profile.skills.find(s => s.id === mission.skillId);
        if (skill) {
            const effectiveXP = isFirstGrind ? mission.xpReward * 2 : mission.xpReward;
            const result = detectRankUp(skill, effectiveXP);
            if (result.didRankUp) {
                setTimeout(() => {
                    setRankUpData({
                        visible: true,
                        rank: result.newRank,
                        sub: result.newSub,
                        skillName: skill.name,
                    });
                }, 300);
            }
        }

        completeMission(missionId);
    };

    const { addMission } = useProfile();

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="section-title flex items-center gap-2 mb-0">
                    <Swords size={14} /> Tablón de Misiones
                </h2>
                <button
                    className="glass-btn glass-btn-primary text-xs"
                    onClick={() => setShowCreate(true)}
                    disabled={profile.skills.length === 0}
                >
                    <Plus size={13} /> Nueva Misión
                </button>
            </div>

            {/* First Grind Banner */}
            {isFirstGrind && activeMissions.length > 0 && (
                <motion.div
                    className="glass-card p-3 text-center mb-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(79, 195, 247, 0.1))',
                        borderColor: 'rgba(255, 215, 0, 0.3)',
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="text-xs font-bold font-heading" style={{ color: '#FFD700' }}>
                        FIRST GRIND OF THE DAY — 2x XP EN LA PRÓXIMA MISIÓN
                    </span>
                </motion.div>
            )}

            {/* Type Tabs */}
            <div className="flex gap-2 mb-5">
                {TYPE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`glass-btn text-xs ${activeTab === tab.id ? 'glass-btn-primary' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon size={13} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Active Missions */}
            {activeMissions.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-aero-blue)' }}>
                        <Clock size={12} /> Activas ({activeMissions.length})
                    </h3>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {activeMissions.map((m) => (
                                <MissionCard key={m.id} mission={m} isFirstGrind={isFirstGrind} onComplete={handleComplete} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Completed */}
            {completedMissions.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-aero-green)' }}>
                        <CheckCircle2 size={12} /> Completadas ({completedMissions.length})
                    </h3>
                    <div className="space-y-3">
                        {completedMissions.slice(-5).map((m) => (
                            <MissionCard key={m.id} mission={m} isFirstGrind={false} onComplete={() => { }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filteredMissions.length === 0 && (
                <div className="glass-card p-8 text-center">
                    <Swords size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {profile.skills.length === 0
                            ? 'Crea habilidades primero para desbloquear misiones'
                            : 'No hay misiones en esta categoría. ¡Crea una!'}
                    </p>
                </div>
            )}

            {/* Modals */}
            <CreateMissionModal
                visible={showCreate}
                skills={profile.skills}
                onClose={() => setShowCreate(false)}
                onSubmit={addMission}
            />
            <RankUpOverlay
                visible={rankUpData.visible}
                newRank={rankUpData.rank}
                newSub={rankUpData.sub}
                skillName={rankUpData.skillName}
                onDismiss={() => setRankUpData(d => ({ ...d, visible: false }))}
            />
        </div>
    );
}
