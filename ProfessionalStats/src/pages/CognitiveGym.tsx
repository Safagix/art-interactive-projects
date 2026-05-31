import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Brain,
    Calculator,
    CheckCircle2,
    Dumbbell,
    Eye,
    Flame,
    GitMerge,
    Grid3X3,
    Lightbulb,
    Network,
    Puzzle,
    RotateCcw,
    Sparkles,
    Timer,
    Info,
    Wand2,
    Zap,
} from 'lucide-react';
import type { CognitiveExercise, CognitiveExerciseId, CognitiveGymState, Difficulty, ExerciseResult } from '@/types';
import {
    COGNITIVE_EXERCISES,
    buildResult,
    domainLabel,
    formatMs,
    generateConvergencePrompt,
    generateCriticalQuestions,
    generateDivergencePrompt,
    generateImprovisationPrompt,
    generateLetterScan,
    generateMaterialPrompt,
    generateMathProblem,
    generatePatternChallenge,
    generateSpeedGrid,
    generateSwitchboardRound,
    loadCognitiveState,
    saveCognitiveSession,
    scoreTextChecklist,
} from '@/services/CognitiveGymEngine';

const iconByExercise: Record<CognitiveExerciseId, typeof Brain> = {
    'speed-grid': Grid3X3,
    'letter-scan': Eye,
    'mental-math': Calculator,
    'pattern-lab': Puzzle,
    'material-remix': Wand2,
    'convergence-forge': GitMerge,
    'divergence-forge': Sparkles,
    'critical-ladder': Network,
    'improvisation-arena': Lightbulb,
    'neural-switchboard': Zap,
};

const difficultyLabel: Record<Difficulty, string> = {
    easy: 'Facil',
    medium: 'Medio',
    hard: 'Dificil',
};

const guideByExercise: Record<CognitiveExerciseId, { goal: string; how: string; score: string }> = {
    'speed-grid': {
        goal: 'Entrena velocidad visual, atencion sostenida y control de errores.',
        how: 'Toca los cuadros en el orden pedido. Asc va de menor a mayor; Desc va de mayor a menor. Si fallas, sigue desde el objetivo actual.',
        score: 'El resultado combina precision menos penalizacion por tiempo. Cada error baja precision y suma castigo.',
    },
    'letter-scan': {
        goal: 'Entrena atencion selectiva y memoria inmediata.',
        how: 'Lee la frase mientras el cronometro corre. Cuando desaparece, escribe cuantas veces viste la letra objetivo.',
        score: 'Cada diferencia entre tu numero y el correcto resta precision.',
    },
    'mental-math': {
        goal: 'Entrena calculo mental bajo presion y velocidad de respuesta.',
        how: 'Pulsa Iniciar sprint. Mientras el tiempo corre, resuelve una operacion, envia, y aparece otra automaticamente.',
        score: 'El resultado mezcla precision y volumen: responder mas operaciones correctas en el tiempo sube el puntaje.',
    },
    'pattern-lab': {
        goal: 'Entrena identificacion de patrones y razonamiento relacional.',
        how: 'Mira la secuencia. El signo ? es el espacio que falta. Elige la opcion que completa la regla escondida.',
        score: 'Respuesta correcta vale alto; respuesta incorrecta muestra la regla para aprender el patron.',
    },
    'material-remix': {
        goal: 'Entrena creatividad aplicada y pensamiento de producto.',
        how: 'Usa el producto y material indicados. Explica proposito, ventaja y limite realista.',
        score: 'El checklist busca material, proposito, ventaja, limite y suficiente desarrollo.',
    },
    'convergence-forge': {
        goal: 'Entrena pensamiento convergente: reducir muchas opciones a una solucion ejecutable.',
        how: 'Escribe 3 a 5 soluciones y luego crea una version final fusionada.',
        score: 'Cuenta variedad inicial y calidad minima de la sintesis final.',
    },
    'divergence-forge': {
        goal: 'Entrena pensamiento divergente: producir muchas rutas posibles.',
        how: 'Escribe una alternativa por linea. Busca cantidad y variedad, no perfeccion.',
        score: 'Sube con mas respuestas y variedad entre ellas.',
    },
    'critical-ladder': {
        goal: 'Entrena pensamiento critico y claridad conceptual.',
        how: 'Carga una idea, responde las preguntas sucesivas y termina con una sintesis minima.',
        score: 'Mide cuantas respuestas tienen desarrollo suficiente y si cerraste con sintesis.',
    },
    'improvisation-arena': {
        goal: 'Entrena improvisacion verbal y conexiones remotas.',
        how: 'Une las dos palabras base usando tambien palabras del banco de entorno.',
        score: 'Sube si conectas ambas palabras, usas pistas y produces una respuesta completa.',
    },
    'neural-switchboard': {
        goal: 'Entrena flexibilidad cognitiva, inhibicion y memoria de trabajo.',
        how: 'Lee la regla actual. A veces respondes la tinta, a veces la palabra, a veces la secuencia.',
        score: 'Correcto vale alto porque exige cambiar de regla sin caer en automatismos.',
    },
};

interface CognitiveGymProps {
    onBack: () => void;
}

export function CognitiveGym({ onBack }: CognitiveGymProps) {
    const [gymState, setGymState] = useState<CognitiveGymState>(() => loadCognitiveState());
    const [activeExerciseId, setActiveExerciseId] = useState<CognitiveExerciseId | null>(null);
    const [lastResult, setLastResult] = useState<ExerciseResult | null>(null);

    const activeExercise = useMemo(
        () => COGNITIVE_EXERCISES.find((exercise) => exercise.id === activeExerciseId) ?? null,
        [activeExerciseId]
    );

    const handleComplete = (result: ExerciseResult) => {
        const nextState = saveCognitiveSession(gymState, result);
        setGymState(nextState);
        setLastResult(result);
    };

    return (
        <div className="cognitive-gym-shell">
            <button className="back-to-nexus" onClick={onBack}>
                <ArrowLeft size={14} /> Nexus
            </button>

            <div className="cog-bg-grid" />
            <div className="cog-bg-scanline" />

            <main className="cognitive-gym">
                <header className="cog-hero">
                    <motion.div
                        className="cog-hero-main"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                    >
                        <div className="cog-eyebrow">
                            <Dumbbell size={16} /> Mental training console
                        </div>
                        <h1>Cognitive Gym</h1>
                        <p>
                            Entrena atencion, calculo, patrones, pensamiento critico, convergencia, divergencia e improvisacion
                            con rondas cortas y medibles.
                        </p>
                    </motion.div>

                    <div className="cog-stats-grid">
                        <StatCard icon={Flame} label="Racha" value={`${gymState.currentStreak}d`} />
                        <StatCard icon={Zap} label="XP cognitivo" value={String(gymState.totalXP)} />
                        <StatCard icon={CheckCircle2} label="Mejor precision" value={`${gymState.bestAccuracy}%`} />
                        <StatCard icon={Timer} label="Mejor tiempo" value={formatMs(gymState.bestTimeMs)} />
                    </div>
                </header>

                <section className="cog-console glass-card">
                    <div className="cog-console-sidebar">
                        <div className="section-title">Apartados</div>
                        <div className="cog-exercise-list">
                            {COGNITIVE_EXERCISES.map((exercise) => {
                                const Icon = iconByExercise[exercise.id];
                                const isActive = activeExerciseId === exercise.id;
                                return (
                                    <button
                                        key={exercise.id}
                                        className={`cog-exercise-tab ${isActive ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveExerciseId(exercise.id);
                                            setLastResult(null);
                                        }}
                                    >
                                        <Icon size={17} />
                                        <span>{exercise.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="cog-last-domain">
                            <span>Ultimo dominio</span>
                            <strong>{domainLabel(gymState.lastDomain)}</strong>
                        </div>
                    </div>

                    <div className="cog-console-stage">
                        {!activeExercise && <CognitiveDashboard onSelect={setActiveExerciseId} lastResult={lastResult} />}
                        {activeExercise && (
                            <ExerciseRouter
                                key={activeExercise.id}
                                exercise={activeExercise}
                                onBack={() => setActiveExerciseId(null)}
                                onComplete={handleComplete}
                                lastResult={lastResult}
                            />
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

function CognitiveDashboard({
    onSelect,
    lastResult,
}: {
    onSelect: (id: CognitiveExerciseId) => void;
    lastResult: ExerciseResult | null;
}) {
    return (
        <div className="cog-dashboard">
            <div className="cog-dashboard-head">
                <div>
                    <div className="cog-eyebrow">Selecciona un modulo</div>
                    <h2>Diez formas de entrenar la mente</h2>
                </div>
                {lastResult && (
                    <div className="cog-result-pill">
                        +{lastResult.xpGained} XP · {lastResult.score}/100
                    </div>
                )}
            </div>

            <div className="cog-module-grid">
                {COGNITIVE_EXERCISES.map((exercise) => {
                    const Icon = iconByExercise[exercise.id];
                    return (
                        <button key={exercise.id} className="cog-module-card" onClick={() => onSelect(exercise.id)}>
                            <Icon size={22} />
                            <strong>{exercise.title}</strong>
                            <span>{exercise.subtitle}</span>
                            <small>{domainLabel(exercise.domain)} · {difficultyLabel[exercise.difficulty]}</small>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function ExerciseRouter({
    exercise,
    onBack,
    onComplete,
    lastResult,
}: {
    exercise: CognitiveExercise;
    onBack: () => void;
    onComplete: (result: ExerciseResult) => void;
    lastResult: ExerciseResult | null;
}) {
    const shared = { exercise, onBack, onComplete, lastResult };
    switch (exercise.id) {
        case 'speed-grid': return <SpeedGridExercise {...shared} />;
        case 'letter-scan': return <LetterScanExercise {...shared} />;
        case 'mental-math': return <MentalMathExercise {...shared} />;
        case 'pattern-lab': return <PatternLabExercise {...shared} />;
        case 'material-remix': return <MaterialRemixExercise {...shared} />;
        case 'convergence-forge': return <ConvergenceForgeExercise {...shared} />;
        case 'divergence-forge': return <DivergenceForgeExercise {...shared} />;
        case 'critical-ladder': return <CriticalLadderExercise {...shared} />;
        case 'improvisation-arena': return <ImprovisationArenaExercise {...shared} />;
        case 'neural-switchboard': return <NeuralSwitchboardExercise {...shared} />;
    }
}

function ExerciseFrame({
    exercise,
    onBack,
    lastResult,
    children,
}: {
    exercise: CognitiveExercise;
    onBack: () => void;
    lastResult: ExerciseResult | null;
    children: React.ReactNode;
}) {
    const Icon = iconByExercise[exercise.id];
    return (
        <div className="cog-exercise-frame">
            <div className="cog-exercise-header">
                <button className="cog-mini-btn" onClick={onBack}>
                    <ArrowLeft size={15} /> Modulos
                </button>
                <div className="cog-exercise-title">
                    <Icon size={22} />
                    <div>
                        <h2>{exercise.title}</h2>
                        <p>{exercise.subtitle}</p>
                    </div>
                </div>
                <div className="cog-difficulty">{difficultyLabel[exercise.difficulty]}</div>
            </div>
            <ExerciseGuide exerciseId={exercise.id} />
            {children}
            {lastResult?.exerciseId === exercise.id && <ResultPanel result={lastResult} />}
        </div>
    );
}

function ExerciseGuide({ exerciseId }: { exerciseId: CognitiveExerciseId }) {
    const guide = guideByExercise[exerciseId];
    return (
        <div className="cog-guide-card">
            <Info size={17} />
            <div>
                <strong>Como se hace</strong>
                <p>{guide.how}</p>
            </div>
            <div>
                <strong>Que entrena</strong>
                <p>{guide.goal}</p>
            </div>
            <div>
                <strong>Score</strong>
                <p>{guide.score}</p>
            </div>
        </div>
    );
}

function SpeedGridExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [size, setSize] = useState(5);
    const [mode, setMode] = useState<'numbers' | 'letters'>('numbers');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
    const [round, setRound] = useState(() => generateSpeedGrid(size, mode, direction));
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [completed, setCompleted] = useState<string[]>([]);
    const elapsedMs = useElapsed(startedAt, currentIndex < round.targetSequence.length);

    const start = () => {
        setRound(generateSpeedGrid(size, mode, direction));
        setStartedAt(Date.now());
        setCurrentIndex(0);
        setMistakes(0);
        setCompleted([]);
    };

    const clickTile = (tile: string) => {
        if (!startedAt) return;
        const expected = round.targetSequence[currentIndex];
        if (tile !== expected) {
            setMistakes((value) => value + 1);
            return;
        }
        const nextCompleted = [...completed, tile];
        setCompleted(nextCompleted);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex === round.targetSequence.length) {
            const durationMs = Date.now() - startedAt + mistakes * 750;
            const accuracy = Math.max(0, 100 - mistakes * 6);
            onComplete(buildResult({
                exercise,
                score: Math.max(20, accuracy - durationMs / 1200),
                accuracy,
                durationMs,
                mistakes,
                summary: `Secuencia completada con ${mistakes} errores.`,
            }));
        }
    };

    return (
        <ExerciseFrame {...props}>
            <div className="cog-config-row">
                <Segmented value={String(size)} options={['3', '4', '5']} onChange={(value) => setSize(Number(value))} />
                <Segmented value={mode} options={['numbers', 'letters']} labels={{ numbers: 'Numeros', letters: 'Letras' }} onChange={(value) => setMode(value as 'numbers' | 'letters')} />
                <Segmented value={direction} options={['asc', 'desc']} labels={{ asc: 'Asc', desc: 'Desc' }} onChange={(value) => setDirection(value as 'asc' | 'desc')} />
                <button className="glass-btn glass-btn-primary" onClick={start}><RotateCcw size={15} /> Iniciar</button>
            </div>
            <div className="speed-grid-status">
                Objetivo: <strong>{startedAt ? round.targetSequence[currentIndex] ?? 'Listo' : 'Configura e inicia'}</strong>
                <span>Tiempo: {formatMs(elapsedMs)}</span>
                <span>Errores: {mistakes}</span>
            </div>
            <div className="speed-grid" style={{ '--grid-size': size } as React.CSSProperties}>
                {round.tiles.map((tile) => (
                    <button
                        key={tile}
                        className={`speed-grid-tile ${completed.includes(tile) ? 'done' : ''}`}
                        onClick={() => clickTile(tile)}
                    >
                        {tile}
                    </button>
                ))}
            </div>
        </ExerciseFrame>
    );
}

function LetterScanExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [seconds, setSeconds] = useState(7);
    const [challenge, setChallenge] = useState(() => generateLetterScan(difficulty));
    const [phase, setPhase] = useState<'ready' | 'memorize' | 'answer'>('ready');
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [answer, setAnswer] = useState('');
    const [startedAt, setStartedAt] = useState(0);

    useCountdown(phase === 'memorize', timeLeft, setTimeLeft, () => setPhase('answer'));

    const start = () => {
        setChallenge(generateLetterScan(difficulty));
        setTimeLeft(seconds);
        setAnswer('');
        setStartedAt(Date.now());
        setPhase('memorize');
    };

    const submit = () => {
        const numeric = Number(answer);
        const delta = Math.abs(numeric - challenge.answer);
        const accuracy = Math.max(0, 100 - delta * 25);
        onComplete(buildResult({
            exercise: { ...exercise, difficulty, durationSeconds: seconds },
            score: accuracy,
            accuracy,
            durationMs: Date.now() - startedAt,
            mistakes: delta,
            summary: `La respuesta correcta era ${challenge.answer} letras "${challenge.letter}".`,
        }));
        setPhase('ready');
    };

    return (
        <ExerciseFrame {...props}>
            <div className="cog-config-row">
                <Segmented value={difficulty} options={['easy', 'medium', 'hard']} labels={difficultyLabel} onChange={(value) => setDifficulty(value as Difficulty)} />
                <Segmented value={String(seconds)} options={['5', '7', '10']} onChange={(value) => setSeconds(Number(value))} />
                <button className="glass-btn glass-btn-primary" onClick={start}>Mostrar frase</button>
            </div>
            {phase === 'memorize' && (
                <div className="letter-flash">
                    <Timer size={18} /> {timeLeft}s
                    <p>{challenge.phrase}</p>
                </div>
            )}
            {phase === 'answer' && (
                <div className="answer-panel">
                    <h3>Cuantas letras "{challenge.letter}" viste?</h3>
                    <input className="glass-input" value={answer} onChange={(event) => setAnswer(event.target.value)} inputMode="numeric" autoFocus />
                    <button className="glass-btn glass-btn-primary" onClick={submit}>Responder</button>
                </div>
            )}
            {phase === 'ready' && <div className="cog-empty-state">La frase desaparece cuando termina el temporizador. Luego respondes de memoria.</div>}
        </ExerciseFrame>
    );
}

function MentalMathExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [seconds, setSeconds] = useState(20);
    const [problem, setProblem] = useState(() => generateMathProblem(difficulty));
    const [answer, setAnswer] = useState('');
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [startedAt, setStartedAt] = useState(0);
    const [running, setRunning] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [attemptCount, setAttemptCount] = useState(0);

    const finishSprint = (finalCorrect = correctCount, finalAttempts = attemptCount) => {
        if (!running) return;
        const accuracy = finalAttempts === 0 ? 0 : Math.round((finalCorrect / finalAttempts) * 100);
        const volumeBonus = Math.min(30, finalCorrect * 5);
        const score = Math.min(100, Math.round(accuracy * 0.7 + volumeBonus));
        onComplete(buildResult({
            exercise: { ...exercise, difficulty, durationSeconds: seconds },
            score,
            accuracy,
            durationMs: Date.now() - startedAt,
            mistakes: Math.max(0, finalAttempts - finalCorrect),
            summary: `Sprint terminado: ${finalCorrect}/${finalAttempts} correctas. Score = precision + bonus por volumen.`,
        }));
        setRunning(false);
    };

    useCountdown(running, timeLeft, setTimeLeft, () => finishSprint());

    const start = () => {
        setProblem(generateMathProblem(difficulty));
        setAnswer('');
        setTimeLeft(seconds);
        setStartedAt(Date.now());
        setCorrectCount(0);
        setAttemptCount(0);
        setRunning(true);
    };

    const submitAnswer = () => {
        if (!running || !answer.trim()) return;
        const isCorrect = Number(answer) === problem.answer;
        const nextCorrect = correctCount + (isCorrect ? 1 : 0);
        const nextAttempts = attemptCount + 1;
        setCorrectCount(nextCorrect);
        setAttemptCount(nextAttempts);
        setProblem(generateMathProblem(difficulty));
        setAnswer('');
    };

    return (
        <ExerciseFrame {...props}>
            <div className="cog-config-row">
                <Segmented value={difficulty} options={['easy', 'medium', 'hard']} labels={difficultyLabel} onChange={(value) => setDifficulty(value as Difficulty)} />
                <Segmented value={String(seconds)} options={['10', '15', '20']} onChange={(value) => setSeconds(Number(value))} />
                <button className="glass-btn glass-btn-primary" onClick={start}>{running ? 'Reiniciar sprint' : 'Iniciar sprint'}</button>
            </div>
            <div className="math-card">
                <div className="cog-live-metrics">
                    <span>{running ? `Tiempo restante: ${timeLeft}s` : `Tiempo: ${seconds}s`}</span>
                    <span>Correctas: {correctCount}</span>
                    <span>Intentos: {attemptCount}</span>
                </div>
                <strong>{problem.prompt}</strong>
                <input
                    className="glass-input"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') submitAnswer();
                    }}
                    inputMode="numeric"
                    disabled={!running}
                    placeholder={running ? 'Respuesta y Enter' : 'Pulsa iniciar sprint'}
                />
                <div className="cog-action-row">
                    <button className="glass-btn glass-btn-primary" onClick={submitAnswer} disabled={!running}>Enviar y seguir</button>
                    <button className="glass-btn" onClick={() => finishSprint()} disabled={!running}>Terminar sprint</button>
                </div>
            </div>
        </ExerciseFrame>
    );
}

function PatternLabExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [challenge, setChallenge] = useState(() => generatePatternChallenge(difficulty));
    const [startedAt, setStartedAt] = useState(Date.now());
    const [answered, setAnswered] = useState(false);
    const elapsedMs = useElapsed(startedAt, !answered);

    const start = () => {
        setChallenge(generatePatternChallenge(difficulty));
        setStartedAt(Date.now());
        setAnswered(false);
    };

    const answer = (value: string) => {
        if (answered) return;
        const correct = value === challenge.answer;
        setAnswered(true);
        onComplete(buildResult({
            exercise: { ...exercise, difficulty },
            score: correct ? 100 : 30,
            accuracy: correct ? 100 : 0,
            durationMs: Date.now() - startedAt,
            mistakes: correct ? 0 : 1,
            summary: correct ? challenge.rule : `Correcto: ${challenge.answer}. ${challenge.rule}`,
        }));
    };

    return (
        <ExerciseFrame {...props}>
            <div className="cog-config-row">
                <Segmented value={difficulty} options={['easy', 'medium', 'hard']} labels={difficultyLabel} onChange={(value) => setDifficulty(value as Difficulty)} />
                <button className="glass-btn glass-btn-primary" onClick={start}>Nuevo patron</button>
            </div>
            <div className="pattern-card">
                <div className="cog-live-metrics">
                    <span>Completa la relacion: reemplaza el ?</span>
                    <span>Tiempo: {formatMs(elapsedMs)}</span>
                </div>
                <strong>{challenge.sequence}</strong>
                <p className="pattern-hint">Busca si la regla es matematica, orden logico, etapa de proceso o categoria comun. Luego toca una opcion.</p>
                <div className="option-grid">
                    {challenge.options.map((option) => (
                        <button key={option} className="cog-option-btn" onClick={() => answer(option)}>{option}</button>
                    ))}
                </div>
            </div>
        </ExerciseFrame>
    );
}

function MaterialRemixExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [prompt, setPrompt] = useState(() => generateMaterialPrompt());
    const [text, setText] = useState('');
    const [startedAt, setStartedAt] = useState(Date.now());

    const reset = () => {
        setPrompt(generateMaterialPrompt());
        setText('');
        setStartedAt(Date.now());
    };

    const submit = () => {
        const score = scoreTextChecklist(text, [prompt.material, 'proposito', 'ventaja', 'limite']);
        onComplete(buildResult({
            exercise,
            score,
            accuracy: score,
            durationMs: Date.now() - startedAt,
            mistakes: score >= 70 ? 0 : 1,
            summary: 'Checklist: material usado, proposito, ventaja y limite.',
        }));
    };

    return <WritingExerciseFrame {...props} promptTitle={`${prompt.product} + ${prompt.material}`} promptText={`Contexto: ${prompt.constraint}. Explica una aplicacion con proposito, ventaja y limite.`} text={text} setText={setText} onReset={reset} onSubmit={submit} />;
}

function ConvergenceForgeExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [prompt, setPrompt] = useState(generateConvergencePrompt);
    const [ideas, setIdeas] = useState('');
    const [final, setFinal] = useState('');
    const [startedAt, setStartedAt] = useState(Date.now());

    const reset = () => {
        setPrompt(generateConvergencePrompt());
        setIdeas('');
        setFinal('');
        setStartedAt(Date.now());
    };

    const submit = () => {
        const ideaCount = ideas.split('\n').filter((line) => line.trim().length > 4).length;
        const finalWords = final.trim().split(/\s+/).filter(Boolean).length;
        const score = Math.min(100, ideaCount * 16 + (finalWords >= 18 ? 35 : 10));
        onComplete(buildResult({
            exercise,
            score,
            accuracy: score,
            durationMs: Date.now() - startedAt,
            mistakes: ideaCount < 3 ? 1 : 0,
            summary: `Cargaste ${ideaCount} ideas y una sintesis final.`,
        }));
    };

    return (
        <ExerciseFrame {...props}>
            <div className="writing-prompt">
                <span>Problema</span>
                <strong>{prompt}</strong>
            </div>
            <textarea className="glass-input cog-textarea" value={ideas} onChange={(event) => setIdeas(event.target.value)} placeholder="Escribe 3-5 soluciones, una por linea." />
            <textarea className="glass-input cog-textarea" value={final} onChange={(event) => setFinal(event.target.value)} placeholder="Fusiona las mejores partes en una sola solucion ejecutable." />
            <div className="cog-action-row">
                <button className="glass-btn" onClick={reset}><RotateCcw size={15} /> Nuevo</button>
                <button className="glass-btn glass-btn-primary" onClick={submit}>Forjar solucion</button>
            </div>
        </ExerciseFrame>
    );
}

function DivergenceForgeExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [prompt, setPrompt] = useState(generateDivergencePrompt);
    const [text, setText] = useState('');
    const [startedAt, setStartedAt] = useState(Date.now());

    const reset = () => {
        setPrompt(generateDivergencePrompt());
        setText('');
        setStartedAt(Date.now());
    };

    const submit = () => {
        const answers = text.split('\n').map((line) => line.trim()).filter(Boolean);
        const uniqueStarts = new Set(answers.map((item) => item.slice(0, 4).toLowerCase())).size;
        const score = Math.min(100, answers.length * 12 + uniqueStarts * 7);
        onComplete(buildResult({
            exercise,
            score,
            accuracy: score,
            durationMs: Date.now() - startedAt,
            mistakes: answers.length < 5 ? 1 : 0,
            summary: `${answers.length} alternativas generadas. Variedad estimada: ${uniqueStarts}.`,
        }));
    };

    return <WritingExerciseFrame {...props} promptTitle="Genera muchas rutas" promptText={prompt} text={text} setText={setText} onReset={reset} onSubmit={submit} placeholder="Una alternativa por linea. Busca cantidad + variedad." />;
}

function CriticalLadderExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [idea, setIdea] = useState('');
    const [questions, setQuestions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const [startedAt, setStartedAt] = useState(Date.now());

    const start = () => {
        setQuestions(generateCriticalQuestions(idea));
        setAnswers([]);
        setSummary('');
        setStartedAt(Date.now());
    };

    const submit = () => {
        const answered = answers.filter((item) => item.trim().split(/\s+/).length >= 5).length;
        const score = Math.min(100, answered * 15 + (summary.trim().split(/\s+/).length >= 15 ? 25 : 5));
        onComplete(buildResult({
            exercise,
            score,
            accuracy: score,
            durationMs: Date.now() - startedAt,
            mistakes: answered < questions.length ? 1 : 0,
            summary: `Escalera completada: ${answered}/${questions.length} respuestas utiles.`,
        }));
    };

    return (
        <ExerciseFrame {...props}>
            <input className="glass-input" value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Escribe la idea que queres cuestionar." />
            <button className="glass-btn glass-btn-primary" onClick={start}>Construir escalera</button>
            {questions.map((question, index) => (
                <label key={question} className="ladder-question">
                    <span>{index + 1}. {question}</span>
                    <textarea
                        className="glass-input"
                        value={answers[index] ?? ''}
                        onChange={(event) => {
                            const next = [...answers];
                            next[index] = event.target.value;
                            setAnswers(next);
                        }}
                    />
                </label>
            ))}
            {questions.length > 0 && (
                <>
                    <textarea className="glass-input cog-textarea" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Sintesis minima: que queda claro ahora?" />
                    <button className="glass-btn glass-btn-primary" onClick={submit}>Cerrar claridad</button>
                </>
            )}
        </ExerciseFrame>
    );
}

function ImprovisationArenaExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [prompt, setPrompt] = useState(generateImprovisationPrompt);
    const [text, setText] = useState('');
    const [startedAt, setStartedAt] = useState(Date.now());

    const reset = () => {
        setPrompt(generateImprovisationPrompt());
        setText('');
        setStartedAt(Date.now());
    };

    const submit = () => {
        const normalized = text.toLowerCase();
        const hits = [prompt.first, prompt.second, ...prompt.bank].filter((word) => normalized.includes(word)).length;
        const score = Math.min(100, hits * 16 + (text.trim().split(/\s+/).length >= 22 ? 25 : 5));
        onComplete(buildResult({
            exercise,
            score,
            accuracy: score,
            durationMs: Date.now() - startedAt,
            mistakes: hits < 2 ? 1 : 0,
            summary: `Conectaste ${hits} palabras/pistas del entorno.`,
        }));
    };

    return (
        <WritingExerciseFrame
            {...props}
            promptTitle={`${prompt.first} + ${prompt.second}`}
            promptText={`Banco de entorno: ${prompt.bank.join(', ')}. Construye una frase, idea u opinion defendible usando lo disponible.`}
            text={text}
            setText={setText}
            onReset={reset}
            onSubmit={submit}
        />
    );
}

function NeuralSwitchboardExercise(props: ExerciseProps) {
    const { exercise, onComplete } = props;
    const [round, setRound] = useState(generateSwitchboardRound);
    const [answer, setAnswer] = useState('');
    const [startedAt, setStartedAt] = useState(Date.now());

    const reset = () => {
        setRound(generateSwitchboardRound());
        setAnswer('');
        setStartedAt(Date.now());
    };

    const submit = (value = answer) => {
        const correct = value.trim().toLowerCase() === round.answer.toLowerCase();
        onComplete(buildResult({
            exercise,
            score: correct ? 100 : 25,
            accuracy: correct ? 100 : 0,
            durationMs: Date.now() - startedAt,
            mistakes: correct ? 0 : 1,
            summary: `Regla: responde por ${round.mode === 'ink' ? 'color de tinta' : round.mode === 'word' ? 'palabra escrita' : 'memoria de posiciones'}. Respuesta: ${round.answer}.`,
        }));
    };

    const options = round.mode === 'position' ? [round.memory.join(' '), [...round.memory].reverse().join(' '), 'A1 B2 D4', 'C3 B2 A1'] : ['rojo', 'azul', 'verde', 'amarillo'];

    return (
        <ExerciseFrame {...props}>
            <div className="switchboard-card">
                <span>{round.mode === 'ink' ? 'Di el color de la tinta' : round.mode === 'word' ? 'Di la palabra escrita' : 'Repite la secuencia memorizada'}</span>
                {round.mode === 'position' ? (
                    <strong>{round.memory.join(' · ')}</strong>
                ) : (
                    <strong style={{ color: round.ink }}>{round.word.toUpperCase()}</strong>
                )}
                <div className="option-grid">
                    {options.map((option) => (
                        <button key={option} className="cog-option-btn" onClick={() => submit(option)}>{option}</button>
                    ))}
                </div>
                <input className="glass-input" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="O escribe tu respuesta exacta." />
                <div className="cog-action-row">
                    <button className="glass-btn" onClick={reset}>Nueva regla</button>
                    <button className="glass-btn glass-btn-primary" onClick={() => submit()}>Enviar</button>
                </div>
            </div>
        </ExerciseFrame>
    );
}

function WritingExerciseFrame({
    exercise,
    onBack,
    lastResult,
    promptTitle,
    promptText,
    text,
    setText,
    onReset,
    onSubmit,
    placeholder = 'Escribe tu respuesta con suficiente detalle para poder evaluarla.',
}: ExerciseProps & {
    promptTitle: string;
    promptText: string;
    text: string;
    setText: (value: string) => void;
    onReset: () => void;
    onSubmit: () => void;
    placeholder?: string;
}) {
    return (
        <ExerciseFrame exercise={exercise} onBack={onBack} lastResult={lastResult}>
            <div className="writing-prompt">
                <span>{promptTitle}</span>
                <strong>{promptText}</strong>
            </div>
            <textarea className="glass-input cog-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} />
            <div className="cog-action-row">
                <button className="glass-btn" onClick={onReset}><RotateCcw size={15} /> Nuevo prompt</button>
                <button className="glass-btn glass-btn-primary" onClick={onSubmit}>Evaluar</button>
            </div>
        </ExerciseFrame>
    );
}

function ResultPanel({ result }: { result: ExerciseResult }) {
    const guide = guideByExercise[result.exerciseId];
    return (
        <motion.div className="cog-result-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
                <span>Resultado</span>
                <strong>{result.score}/100</strong>
            </div>
            <div>
                <span>Precision</span>
                <strong>{result.accuracy}%</strong>
            </div>
            <div>
                <span>XP</span>
                <strong>+{result.xpGained}</strong>
            </div>
            <div>
                <span>Tiempo usado</span>
                <strong>{formatMs(result.durationMs)}</strong>
            </div>
            <div>
                <span>Errores</span>
                <strong>{result.mistakes}</strong>
            </div>
            <p>{result.summary}</p>
            <p>
                <b>Que significa {result.score}/100:</b> {scoreMeaning(result.score)} {guide.score}
            </p>
        </motion.div>
    );
}

function scoreMeaning(score: number) {
    if (score >= 90) return 'rendimiento excelente: rapido, preciso y con buena ejecucion.';
    if (score >= 75) return 'rendimiento fuerte: buena precision con margen para subir velocidad o volumen.';
    if (score >= 55) return 'rendimiento medio: completaste la tarea, pero hubo costo por errores, tiempo o poco desarrollo.';
    if (score >= 30) return 'rendimiento bajo: el sistema detecto errores importantes o respuesta incompleta.';
    return 'ronda de practica: sirve para aprender la regla antes de buscar velocidad.';
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Brain; label: string; value: string }) {
    return (
        <div className="cog-stat-card glass-card">
            <Icon size={18} />
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function Segmented({
    value,
    options,
    labels,
    onChange,
}: {
    value: string;
    options: string[];
    labels?: Record<string, string>;
    onChange: (value: string) => void;
}) {
    return (
        <div className="cog-segmented">
            {options.map((option) => (
                <button key={option} className={value === option ? 'active' : ''} onClick={() => onChange(option)}>
                    {labels?.[option] ?? option}
                </button>
            ))}
        </div>
    );
}

function useCountdown(active: boolean, timeLeft: number, setTimeLeft: (value: number | ((prev: number) => number)) => void, onDone: () => void) {
    useEffect(() => {
        if (!active) return;
        if (timeLeft <= 0) {
            onDone();
            return;
        }
        const id = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => window.clearTimeout(id);
    }, [active, timeLeft, setTimeLeft, onDone]);
}

function useElapsed(startedAt: number | null, active: boolean) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startedAt) {
            setElapsed(0);
            return;
        }
        setElapsed(Date.now() - startedAt);
        if (!active) return;
        const id = window.setInterval(() => setElapsed(Date.now() - startedAt), 150);
        return () => window.clearInterval(id);
    }, [startedAt, active]);

    return elapsed;
}

type ExerciseProps = {
    exercise: CognitiveExercise;
    onBack: () => void;
    onComplete: (result: ExerciseResult) => void;
    lastResult: ExerciseResult | null;
};
