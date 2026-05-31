import type {
    CognitiveDomain,
    CognitiveExercise,
    CognitiveExerciseId,
    CognitiveGymState,
    CognitiveSession,
    Difficulty,
    ExerciseResult,
} from '@/types';

export const COGNITIVE_STORAGE_KEY = 'professionalstats_cognitive_gym';

export const COGNITIVE_EXERCISES: CognitiveExercise[] = [
    {
        id: 'speed-grid',
        title: 'Speed Grid',
        subtitle: 'Ordena numeros o letras antes de perder el hilo visual.',
        domain: 'processing_speed',
        durationSeconds: 45,
        difficulty: 'medium',
        xpBase: 70,
    },
    {
        id: 'letter-scan',
        title: 'Letter Scan',
        subtitle: 'Memoriza una frase y cuenta una vocal despues del flash.',
        domain: 'attention',
        durationSeconds: 10,
        difficulty: 'medium',
        xpBase: 60,
    },
    {
        id: 'mental-math',
        title: 'Mental Math Sprint',
        subtitle: 'Calcula rapido sin calculadora, con presion de tiempo.',
        domain: 'mental_math',
        durationSeconds: 20,
        difficulty: 'medium',
        xpBase: 75,
    },
    {
        id: 'pattern-lab',
        title: 'Pattern Lab',
        subtitle: 'Detecta la relacion oculta entre numeros, palabras u objetos.',
        domain: 'pattern_recognition',
        durationSeconds: 25,
        difficulty: 'medium',
        xpBase: 70,
    },
    {
        id: 'material-remix',
        title: 'Material Remix',
        subtitle: 'Reemplaza materiales con proposito, ventaja y limite realista.',
        domain: 'divergent_thinking',
        durationSeconds: 120,
        difficulty: 'medium',
        xpBase: 90,
    },
    {
        id: 'convergence-forge',
        title: 'Convergence Forge',
        subtitle: 'Fusiona muchas soluciones en una respuesta mas fuerte.',
        domain: 'convergent_thinking',
        durationSeconds: 150,
        difficulty: 'medium',
        xpBase: 95,
    },
    {
        id: 'divergence-forge',
        title: 'Divergence Forge',
        subtitle: 'Genera alternativas originales desde una restriccion pequena.',
        domain: 'divergent_thinking',
        durationSeconds: 90,
        difficulty: 'medium',
        xpBase: 85,
    },
    {
        id: 'critical-ladder',
        title: 'Critical Ladder',
        subtitle: 'Cuestiona una idea hasta encontrar claridad minima.',
        domain: 'critical_thinking',
        durationSeconds: 180,
        difficulty: 'medium',
        xpBase: 100,
    },
    {
        id: 'improvisation-arena',
        title: 'Improvisation Arena',
        subtitle: 'Une palabras lejanas y construye una respuesta defendible.',
        domain: 'improvisation',
        durationSeconds: 100,
        difficulty: 'medium',
        xpBase: 85,
    },
    {
        id: 'neural-switchboard',
        title: 'Neural Switchboard',
        subtitle: 'Cambia reglas, inhibe impulsos y usa memoria de trabajo.',
        domain: 'cognitive_flexibility',
        durationSeconds: 35,
        difficulty: 'hard',
        xpBase: 100,
    },
];

const phrases = {
    easy: [
        'La practica diaria convierte la atencion en una herramienta precisa.',
        'Pensar lento por un momento puede acelerar la decision correcta.',
        'Una buena pregunta abre mas camino que una respuesta rapida.',
    ],
    medium: [
        'Cuando una idea parece obvia, conviene mirar sus limites, sus supuestos y el costo real de aplicarla.',
        'La creatividad aparece cuando conectas restricciones, materiales y necesidades que antes parecian separadas.',
        'Entrenar la mente exige medir velocidad, precision y capacidad de cambiar de estrategia sin perder el objetivo.',
    ],
    hard: [
        'Si una respuesta nace de memoria pero no de comprension, puede sonar correcta y aun asi fallar cuando cambia el contexto del problema.',
        'El pensamiento convergente no elimina la creatividad: la comprime, la ordena y la transforma en una solucion que puede ejecutarse.',
        'Improvisar bien no significa inventar al azar, sino usar las pistas disponibles para construir una interpretacion util bajo presion.',
    ],
};

const products = ['celular', 'mochila', 'cinto', 'silla', 'botella', 'auricular', 'bicicleta', 'cuaderno'];
const materials = ['titanio', 'bambu laminado', 'fibra de carbono', 'corcho', 'aluminio reciclado', 'micelio', 'silicona medica', 'vidrio templado'];
const ideaPrompts = [
    'un aula sin internet',
    'un negocio pequeno con poco presupuesto',
    'una persona que estudia de noche',
    'un deportista que viaja mucho',
    'un estudiante en examen oral',
    'una app para ahorrar tiempo',
];
const words = ['brujula', 'algoritmo', 'lluvia', 'mercado', 'silencio', 'puente', 'examen', 'energia', 'mapa', 'ritmo'];

export function createDefaultCognitiveState(): CognitiveGymState {
    return {
        sessions: [],
        totalXP: 0,
        currentStreak: 0,
        bestAccuracy: 0,
        bestTimeMs: null,
        lastDomain: null,
        lastSessionAt: null,
    };
}

export function loadCognitiveState(): CognitiveGymState {
    try {
        const raw = localStorage.getItem(COGNITIVE_STORAGE_KEY);
        if (!raw) return createDefaultCognitiveState();
        const parsed = JSON.parse(raw) as Partial<CognitiveGymState>;
        return {
            ...createDefaultCognitiveState(),
            ...parsed,
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions.slice(-40) : [],
        };
    } catch (error) {
        console.error('[CognitiveGym] Failed to load state', error);
        return createDefaultCognitiveState();
    }
}

export function saveCognitiveSession(state: CognitiveGymState, result: ExerciseResult): CognitiveGymState {
    const now = new Date().toISOString();
    const session: CognitiveSession = {
        id: `cog-${Date.now()}`,
        exerciseId: result.exerciseId,
        startedAt: new Date(Date.now() - result.durationMs).toISOString(),
        finishedAt: now,
        result,
    };
    const sessions = [...state.sessions, session].slice(-40);
    const nextState: CognitiveGymState = {
        sessions,
        totalXP: sessions.reduce((sum, item) => sum + item.result.xpGained, 0),
        currentStreak: calculateStreak(sessions),
        bestAccuracy: Math.max(state.bestAccuracy, result.accuracy),
        bestTimeMs:
            result.accuracy >= 70
                ? state.bestTimeMs === null
                    ? result.durationMs
                    : Math.min(state.bestTimeMs, result.durationMs)
                : state.bestTimeMs,
        lastDomain: result.domain,
        lastSessionAt: now,
    };
    localStorage.setItem(COGNITIVE_STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
}

export function generateSpeedGrid(size: number, mode: 'numbers' | 'letters', direction: 'asc' | 'desc') {
    const count = size * size;
    const ordered = Array.from({ length: count }, (_, index) =>
        mode === 'numbers' ? String(index + 1) : String.fromCharCode(65 + index)
    );
    return {
        tiles: shuffle(ordered),
        targetSequence: direction === 'asc' ? ordered : [...ordered].reverse(),
    };
}

export function generateLetterScan(difficulty: Difficulty, targetLetter?: string) {
    const phrase = pick(phrases[difficulty]);
    const letter = targetLetter ?? pick(['a', 'e', 'i', 'o', 'u']);
    const normalized = phrase.toLowerCase();
    return {
        phrase,
        letter,
        answer: normalized.split('').filter((char) => char === letter).length,
    };
}

export function generateMathProblem(difficulty: Difficulty) {
    const ops = difficulty === 'easy' ? ['+', '-'] : difficulty === 'medium' ? ['+', '-', 'x'] : ['+', '-', 'x', '/'];
    const op = pick(ops);
    const max = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 60 : 140;
    let a = rand(2, max);
    let b = rand(2, difficulty === 'hard' ? 18 : 12);
    let answer = 0;

    if (op === '+') answer = a + b;
    if (op === '-') {
        if (b > a) [a, b] = [b, a];
        answer = a - b;
    }
    if (op === 'x') answer = a * b;
    if (op === '/') {
        answer = rand(2, difficulty === 'hard' ? 20 : 12);
        b = rand(2, difficulty === 'hard' ? 16 : 10);
        a = answer * b;
    }

    return { prompt: `${a} ${op} ${b}`, answer };
}

export function generatePatternChallenge(difficulty: Difficulty) {
    const numeric = [
        { sequence: '2, 4, 8, 16, ?', answer: '32', rule: 'Se duplica cada termino.' },
        { sequence: '3, 6, 11, 18, ?', answer: '27', rule: 'Suma impares crecientes: +3, +5, +7, +9.' },
        { sequence: '1, 1, 2, 3, 5, ?', answer: '8', rule: 'Fibonacci: cada termino suma los dos anteriores.' },
    ];
    const verbal = [
        { sequence: 'semilla, raiz, tallo, hoja, ?', answer: 'flor', rule: 'Etapas de crecimiento vegetal.' },
        { sequence: 'dato, patron, hipotesis, prueba, ?', answer: 'conclusion', rule: 'Flujo de razonamiento cientifico.' },
        { sequence: 'idea, boceto, prototipo, feedback, ?', answer: 'iteracion', rule: 'Ciclo de diseno.' },
    ];
    const pool = difficulty === 'easy' ? numeric : difficulty === 'medium' ? [...numeric, ...verbal] : [...verbal, ...numeric];
    const challenge = pick(pool);
    const distractors = shuffle(['24', 'flor', 'conclusion', 'iteracion', '64', '13', '27', '32']).filter(
        (item) => item !== challenge.answer
    );
    return {
        ...challenge,
        options: shuffle([challenge.answer, ...distractors.slice(0, 3)]),
    };
}

export function generateMaterialPrompt() {
    return {
        product: pick(products),
        material: pick(materials),
        constraint: pick(ideaPrompts),
    };
}

export function generateDivergencePrompt() {
    return `Genera usos o respuestas para: ${pick(ideaPrompts)} + ${pick(words)}.`;
}

export function generateConvergencePrompt() {
    return `Problema: ${pick(ideaPrompts)}. Carga varias soluciones y fusionalas en una version ejecutable.`;
}

export function generateImprovisationPrompt() {
    const first = pick(words);
    let second = pick(words);
    while (second === first) second = pick(words);
    return {
        first,
        second,
        bank: shuffle(['definicion', 'ejemplo', 'causa', 'limite', 'comparacion', 'objetivo']).slice(0, 4),
    };
}

export function generateCriticalQuestions(idea: string) {
    const subject = idea.trim() || 'esta idea';
    return [
        `Por que ${subject} importa ahora?`,
        'Que supuesto estas dando por verdadero?',
        'Que evidencia o experiencia lo apoya?',
        'Que contraejemplo podria debilitarlo?',
        'Cual es la version minima y clara de la idea?',
    ];
}

export function generateSwitchboardRound() {
    const colorNames = ['rojo', 'azul', 'verde', 'amarillo'];
    const inkColors = ['#ff4655', '#4fc3f7', '#28c840', '#ffd700'];
    const wordIndex = rand(0, colorNames.length - 1);
    let inkIndex = rand(0, inkColors.length - 1);
    if (Math.random() > 0.35) {
        while (inkIndex === wordIndex) inkIndex = rand(0, inkColors.length - 1);
    }
    const mode = pick(['ink', 'word', 'position'] as const);
    const memory = shuffle(['A1', 'B2', 'C3', 'D4']).slice(0, 3);
    return {
        mode,
        word: colorNames[wordIndex],
        ink: inkColors[inkIndex],
        inkName: colorNames[inkIndex],
        memory,
        answer: mode === 'ink' ? colorNames[inkIndex] : mode === 'word' ? colorNames[wordIndex] : memory.join(' '),
    };
}

export function scoreTextChecklist(text: string, checklist: string[]) {
    const normalized = text.toLowerCase();
    const hits = checklist.filter((item) => normalized.includes(item)).length;
    const lengthBonus = text.trim().split(/\s+/).filter(Boolean).length >= 18 ? 1 : 0;
    return Math.min(100, Math.round(((hits + lengthBonus) / (checklist.length + 1)) * 100));
}

export function buildResult(params: {
    exercise: CognitiveExercise;
    score: number;
    accuracy: number;
    durationMs: number;
    mistakes: number;
    summary: string;
}): ExerciseResult {
    const difficultyMultiplier = params.exercise.difficulty === 'easy' ? 0.85 : params.exercise.difficulty === 'hard' ? 1.25 : 1;
    const xpGained = Math.max(5, Math.round(params.exercise.xpBase * difficultyMultiplier * (params.score / 100)));
    return {
        exerciseId: params.exercise.id,
        title: params.exercise.title,
        domain: params.exercise.domain,
        difficulty: params.exercise.difficulty,
        score: clamp(Math.round(params.score), 0, 100),
        accuracy: clamp(Math.round(params.accuracy), 0, 100),
        xpGained,
        durationMs: Math.max(0, Math.round(params.durationMs)),
        mistakes: params.mistakes,
        createdAt: new Date().toISOString(),
        summary: params.summary,
    };
}

function calculateStreak(sessions: CognitiveSession[]) {
    const days = new Set(sessions.map((session) => session.finishedAt.slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    while (days.has(cursor.toISOString().slice(0, 10))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

export function formatMs(ms: number | null) {
    if (ms === null) return '--';
    return `${(ms / 1000).toFixed(1)}s`;
}

export function domainLabel(domain: CognitiveDomain | null) {
    if (!domain) return 'Sin registro';
    return {
        attention: 'Atencion',
        working_memory: 'Memoria de trabajo',
        processing_speed: 'Velocidad',
        mental_math: 'Calculo mental',
        pattern_recognition: 'Patrones',
        critical_thinking: 'Pensamiento critico',
        convergent_thinking: 'Convergente',
        divergent_thinking: 'Divergente',
        cognitive_flexibility: 'Flexibilidad',
        improvisation: 'Improvisacion',
    }[domain];
}

function pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
