// =============================================================================
// App V5 — Root with Nexus Hub, Stats module & Cognitive Gym module
// =============================================================================

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { BurnoutShield } from '@/components/BurnoutShield';
import { Dashboard } from '@/pages/Dashboard';
import { DailySchedule } from '@/pages/DailySchedule';
import { RankProfile } from '@/pages/RankProfile';
import { SkillTree } from '@/pages/SkillTree';
import { BountyBoard } from '@/pages/BountyBoard';
import { SettingsPage } from '@/pages/SettingsPage';
import { WelcomeScreen } from '@/pages/WelcomeScreen';
import { TheForge } from '@/pages/TheForge';
import { TheChronicle } from '@/pages/TheChronicle';
import { EndOfDay } from '@/pages/EndOfDay';
import { HabitOrbits } from '@/pages/HabitOrbits';
import { SystemGuide } from '@/pages/SystemGuide';
import { NexusHub, type NexusChoice } from '@/pages/NexusHub';
import { CognitiveGym } from '@/pages/CognitiveGym';
import { evaluateBurnoutRisk } from '@/services/BurnoutEngine';
import { getLocalDateKey } from '@/services/DateService';
import { getDailyRecord } from '@/services/DailyPlanService';

type AppPhase =
    | 'nexus'
    | 'stats-welcome'
    | 'burnout-block'
    | 'stats-main'
    | 'end-of-day'
    | 'cognitive-app';

function AppContent() {
    const { profile, setSleepHours, closeDay } = useProfile();
    const [phase, setPhase] = useState<AppPhase>('nexus');
    const [activePage, setActivePage] = useState<PageId>('dashboard');
    const [burnoutData, setBurnoutData] = useState<{ reason: string; suggestion: string } | null>(null);
    const [endOfDayType, setEndOfDayType] = useState<'triumph' | 'patience'>('triumph');

    // Nexus selection
    const handleNexusSelect = (choice: NexusChoice) => {
        if (choice === 'stats') {
            setPhase('stats-welcome');
        } else {
            setPhase('cognitive-app');
        }
    };

    // Back to Nexus
    const handleBackToNexus = () => {
        setPhase('nexus');
    };

    // Handle Welcome -> Burnout check -> Main transition
    const handleStartDay = (sleepHours: number) => {
        setSleepHours(sleepHours);

        const check = evaluateBurnoutRisk(profile.currentStreak, sleepHours);
        if (check.isBlocked) {
            setBurnoutData({ reason: check.reason!, suggestion: check.suggestion });
            setPhase('burnout-block');
        } else {
            setPhase('stats-main');
        }
    };

    const handleBurnoutComplete = () => {
        setPhase('stats-main');
        setBurnoutData(null);
    };

    // End of Day trigger
    const handleEndOfDay = () => {
        const habits = profile.habits || [];
        const todayRecord = getDailyRecord(profile, getLocalDateKey());
        const allComplete = habits.length > 0 && habits.every((habit) => todayRecord.habitStates[habit.id] === 'complete');
        setEndOfDayType(allComplete ? 'triumph' : 'patience');
        closeDay();
        setPhase('end-of-day');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'schedule': return <DailySchedule />;
            case 'rank': return <RankProfile />;
            case 'skills': return <SkillTree />;
            case 'bounty': return <BountyBoard />;
            case 'forge': return <TheForge />;
            case 'chronicle': return <TheChronicle />;
            case 'orbits': return <HabitOrbits />;
            case 'guide': return <SystemGuide />;
            case 'settings': return <SettingsPage />;
        }
    };

    // ── NEXUS HUB ──
    if (phase === 'nexus') {
        return <NexusHub onSelect={handleNexusSelect} />;
    }

    // ── STATS: Welcome Phase ──
    if (phase === 'stats-welcome') {
        return (
            <>
                <div className="ambient-bg" />
                <button className="back-to-nexus" onClick={handleBackToNexus}>
                    <ArrowLeft size={14} /> Nexus
                </button>
                <WelcomeScreen onStart={handleStartDay} />
            </>
        );
    }

    // ── STATS: Burnout Block ──
    if (phase === 'burnout-block' && burnoutData) {
        return (
            <>
                <div className="ambient-bg" />
                <BurnoutShield
                    reason={burnoutData.reason}
                    suggestion={burnoutData.suggestion}
                    onComplete={handleBurnoutComplete}
                />
            </>
        );
    }

    // ── STATS: End of Day ──
    if (phase === 'end-of-day') {
        return (
            <AnimatePresence>
                <EndOfDay type={endOfDayType} onDismiss={() => setPhase('stats-main')} />
            </AnimatePresence>
        );
    }

    // ── COGNITIVE GYM ──
    if (phase === 'cognitive-app') {
        return <CognitiveGym onBack={handleBackToNexus} />;
    }

    // ── STATS: Main App ──
    return (
        <>
            <div className="ambient-bg" />
            <button className="back-to-nexus stats-back-to-nexus" onClick={handleBackToNexus}>
                <ArrowLeft size={14} /> Nexus
            </button>
            <Sidebar activePage={activePage} onNavigate={setActivePage} onEndDay={handleEndOfDay} />
            <main className="main-content">
                {renderPage()}
            </main>
        </>
    );
}

function App() {
    return (
        <ProfileProvider>
            <AppContent />
        </ProfileProvider>
    );
}

export default App;
