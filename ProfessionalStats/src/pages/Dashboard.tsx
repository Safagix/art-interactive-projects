// =============================================================================
// Dashboard — Main page composing all modules together
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Swords, LayoutGrid } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { detectRankUp } from '@/services/RankEngine';
import { hasCompletedToday } from '@/services/MissionEngine';
import type { RankName, SubDivision } from '@/types';

// Components
import { ProfileHeader } from '@/components/ProfileHeader';
import { SkillCard } from '@/components/SkillCard';
import { MissionCard } from '@/components/MissionCard';
import { StatsRadar } from '@/components/StatsRadar';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { RankUpOverlay } from '@/components/RankUpOverlay';
import { CreateSkillModal } from '@/components/CreateSkillModal';
import { CreateMissionModal } from '@/components/CreateMissionModal';

export function Dashboard() {
    const {
        profile,
        addSkill,
        addMission,
        completeMission,
        runDecayCheck,
        runMissionExpiry,
    } = useProfile();

    // Modal states
    const [showCreateSkill, setShowCreateSkill] = useState(false);
    const [showCreateMission, setShowCreateMission] = useState(false);

    // Rank-up overlay state
    const [rankUpData, setRankUpData] = useState<{
        visible: boolean;
        rank: RankName;
        sub: SubDivision;
        skillName: string;
    }>({ visible: false, rank: 'Iron', sub: 1, skillName: '' });

    // Run decay + mission expiry on mount
    useEffect(() => {
        runDecayCheck();
        runMissionExpiry();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle mission completion with rank-up detection
    const handleCompleteMission = useCallback(
        (missionId: string) => {
            const mission = profile.missions.find((m) => m.id === missionId);
            if (!mission) return;

            const skill = profile.skills.find((s) => s.id === mission.skillId);
            if (skill) {
                const isFirstGrind = !hasCompletedToday(profile.missions);
                const effectiveXP = isFirstGrind ? mission.xpReward * 2 : mission.xpReward;
                const result = detectRankUp(skill, effectiveXP);

                if (result.didRankUp) {
                    // Delay the overlay slightly for dramatic effect
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
        },
        [profile.missions, profile.skills, completeMission]
    );

    const activeMissions = profile.missions.filter((m) => m.status === 'active');
    const completedMissions = profile.missions.filter((m) => m.status === 'completed');
    const isFirstGrind = !hasCompletedToday(profile.missions);

    return (
        <div className="page-content">
            {/* Header */}
            <ProfileHeader profile={profile} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT COLUMN: Skills */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="section-title flex items-center gap-2">
                            <LayoutGrid size={13} /> Habilidades
                        </h2>
                        <button
                            className="glass-btn glass-btn-primary text-xs"
                            onClick={() => setShowCreateSkill(true)}
                        >
                            <Plus size={13} /> Nueva
                        </button>
                    </div>

                    <AnimatePresence>
                        {profile.skills.length === 0 ? (
                            <motion.div
                                className="glass-card p-6 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                    No tienes habilidades aún
                                </p>
                                <button
                                    className="glass-btn glass-btn-primary"
                                    onClick={() => setShowCreateSkill(true)}
                                >
                                    <Plus size={14} /> Crear primera habilidad
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {profile.skills.map((skill) => (
                                    <SkillCard key={skill.id} skill={skill} />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CENTER COLUMN: Missions */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="section-title flex items-center gap-2">
                            <Swords size={13} /> Misiones
                        </h2>
                        <button
                            className="glass-btn glass-btn-primary text-xs"
                            onClick={() => setShowCreateMission(true)}
                            disabled={profile.skills.length === 0}
                        >
                            <Plus size={13} /> Nueva
                        </button>
                    </div>

                    {/* First Grind Banner */}
                    {isFirstGrind && activeMissions.length > 0 && (
                        <motion.div
                            className="glass-card p-3 text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(79, 195, 247, 0.1))',
                                borderColor: 'rgba(255, 215, 0, 0.3)',
                            }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="text-xs font-bold" style={{ color: '#FFD700' }}>
                                ⚡ FIRST GRIND OF THE DAY — 2x XP
                            </span>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {activeMissions.length === 0 && completedMissions.length === 0 ? (
                            <motion.div
                                className="glass-card p-6 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                    {profile.skills.length === 0
                                        ? 'Crea habilidades para desbloquear misiones'
                                        : 'No tienes misiones activas'}
                                </p>
                                {profile.skills.length > 0 && (
                                    <button
                                        className="glass-btn glass-btn-primary"
                                        onClick={() => setShowCreateMission(true)}
                                    >
                                        <Plus size={14} /> Crear misión
                                    </button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {activeMissions.map((mission) => (
                                    <MissionCard
                                        key={mission.id}
                                        mission={mission}
                                        isFirstGrind={isFirstGrind}
                                        onComplete={handleCompleteMission}
                                    />
                                ))}
                                {completedMissions.slice(-3).map((mission) => (
                                    <MissionCard
                                        key={mission.id}
                                        mission={mission}
                                        isFirstGrind={false}
                                        onComplete={() => { }}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT COLUMN: Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="section-title">📊 Estadísticas</h2>
                    <StatsRadar />
                    <ActivityHeatmap activityLog={profile.activityLog} />
                </div>
            </div>

            {/* Modals */}
            <CreateSkillModal
                visible={showCreateSkill}
                onClose={() => setShowCreateSkill(false)}
                onSubmit={addSkill}
            />
            <CreateMissionModal
                visible={showCreateMission}
                skills={profile.skills}
                onClose={() => setShowCreateMission(false)}
                onSubmit={addMission}
            />

            {/* Rank-Up Overlay */}
            <RankUpOverlay
                visible={rankUpData.visible}
                newRank={rankUpData.rank}
                newSub={rankUpData.sub}
                skillName={rankUpData.skillName}
                onDismiss={() => setRankUpData((d) => ({ ...d, visible: false }))}
            />
        </div>
    );
}
