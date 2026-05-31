import { motion } from 'framer-motion';
import {
    CalendarClock,
    Check,
    Circle,
    Clock3,
    FastForward,
    Minus,
    SkipForward,
    Target,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { getLocalDateKey } from '@/services/DateService';
import {
    calculateDailyScore,
    getCurrentAndNextBlocks,
    getDailyRecord,
    getRoadmapFocus,
    getTodayBlocks,
} from '@/services/DailyPlanService';
import type { DailyItemState, TodayBlock } from '@/types';

const STATE_OPTIONS: { value: DailyItemState; label: string; icon: typeof Circle }[] = [
    { value: 'pending', label: 'Pendiente', icon: Circle },
    { value: 'done', label: 'Hecho', icon: Check },
    { value: 'partial', label: 'Parcial', icon: Minus },
    { value: 'skipped', label: 'Saltado', icon: SkipForward },
];

const WEEKDAY_LABELS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function DailySchedule() {
    const { profile, updateScheduleState, updateDailyNotes } = useProfile();
    const now = new Date();
    const today = getLocalDateKey(now);
    const todayRecord = getDailyRecord(profile, today);
    const blocks = getTodayBlocks(profile, now);
    const { current, next } = getCurrentAndNextBlocks(blocks, now);
    const score = calculateDailyScore(todayRecord, profile.habits, blocks);
    const progressPct = blocks.length > 0
        ? Math.round((blocks.filter((block) => block.state === 'done').length / blocks.length) * 100)
        : 0;
    const classBlocks = blocks.filter((block) => block.kind === 'class' && block.id.startsWith('class-'));

    return (
        <div className="page-content daily-schedule-page">
            <div className="daily-schedule-hero">
                <div>
                    <div className="daily-schedule-eyebrow">
                        <CalendarClock size={15} />
                        {WEEKDAY_LABELS[now.getDay()]} · {today}
                    </div>
                    <h1>Horario del Día</h1>
                    <p>{getRoadmapFocus(now)}</p>
                </div>
                <div className="daily-score-panel">
                    <span className="daily-score-value">{score.score}/4</span>
                    <span className="daily-score-label">score estimado</span>
                    <span className="daily-score-xp">+{score.xp} XP al cerrar</span>
                </div>
            </div>

            <div className="daily-status-grid">
                <StatusPanel title="Ahora" block={current} icon={Clock3} empty="No hay bloque activo" />
                <StatusPanel title="Siguiente" block={next} icon={FastForward} empty="No quedan bloques hoy" />
                <div className="glass-card daily-progress-card">
                    <span className="daily-card-title">
                        <Target size={14} /> Progreso horario
                    </span>
                    <strong>{progressPct}%</strong>
                    <div className="xp-bar-container">
                        <motion.div className="xp-bar-fill" animate={{ width: `${progressPct}%` }} />
                    </div>
                    <small>{blocks.filter((block) => block.state === 'done').length}/{blocks.length} bloques hechos</small>
                </div>
            </div>

            {classBlocks.length > 0 && (
                <section className="glass-card daily-classes-card">
                    <h2 className="section-title">Clases de facultad</h2>
                    <div className="daily-class-list">
                        {classBlocks.map((block) => (
                            <div key={block.id} className="daily-class-chip">
                                <span>{block.start} - {block.end}</span>
                                <strong>{block.title}</strong>
                                {block.location && <small>{block.location}</small>}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="daily-block-list">
                {blocks.map((block, index) => (
                    <motion.article
                        key={block.id}
                        className={`glass-card daily-block-card ${current?.id === block.id ? 'is-current' : ''}`}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                    >
                        <div className="daily-block-time">
                            <span>{block.start}</span>
                            <i />
                            <span>{block.end}</span>
                        </div>

                        <div className="daily-block-main">
                            <div className="daily-block-heading">
                                <span className={`daily-kind-pill kind-${block.kind}`}>{block.kind}</span>
                                <h3>{block.title}</h3>
                            </div>
                            <p>{block.description}</p>
                            {block.location && <small>{block.location}</small>}
                        </div>

                        <div className="daily-state-controls">
                            {STATE_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const active = block.state === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        className={`daily-state-btn state-${option.value} ${active ? 'active' : ''}`}
                                        onClick={() => updateScheduleState(block.id, option.value, today)}
                                        title={option.label}
                                    >
                                        <Icon size={14} />
                                        <span>{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.article>
                ))}
            </section>

            <section className="glass-card daily-notes-card">
                <h2 className="section-title">Notas del día</h2>
                <textarea
                    className="glass-input daily-notes-input"
                    value={todayRecord.notes}
                    onChange={(event) => updateDailyNotes(event.target.value, today)}
                    placeholder="Qué ajustar mañana, qué te trabó, qué salió bien..."
                />
            </section>
        </div>
    );
}

function StatusPanel({
    title,
    block,
    icon: Icon,
    empty,
}: {
    title: string;
    block: TodayBlock | null;
    icon: typeof Clock3;
    empty: string;
}) {
    return (
        <div className="glass-card daily-status-card">
            <span className="daily-card-title">
                <Icon size={14} /> {title}
            </span>
            {block ? (
                <>
                    <strong>{block.title}</strong>
                    <small>{block.start} - {block.end}</small>
                </>
            ) : (
                <small>{empty}</small>
            )}
        </div>
    );
}
