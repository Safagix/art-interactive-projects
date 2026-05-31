// =============================================================================
// PromptEngine — Spark vs. Facilitator Notification Architecture
// =============================================================================
// Classifies habits by effort + motivation to determine notification tone.
// Zero AI calls — all prompts are pre-written and selected by logic.
// =============================================================================

export type PromptType = 'spark' | 'facilitator';

/**
 * Determine the prompt type based on effort and motivation levels.
 * High Effort + High Motivation = Spark (epic, narrative, RPG commander)
 * High Effort + Low Motivation  = Facilitator (reductionist, forgiving, monk)
 */
export function classifyPromptType(
    effortLevel: number,
    baseMotivation: number
): PromptType {
    if (baseMotivation >= 6) return 'spark';
    return 'facilitator';
}

// Spark Prompts — Epic, RPG commander tone
const SPARK_PROMPTS = [
    'Tu squad mental depende de que domines este ciclo. Cierra todo y forja la habilidad.',
    'Visualiza el resultado final. Ahora hazlo realidad. Este es tu momento.',
    'Los guerreros no esperan motivación — actúan. Tu futuro se construye AHORA.',
    'Cada repetición te acerca a la maestría. El camino del diamante es constancia pura.',
    'Este hábito es tu espada. Afílala hoy y mañana cortarás montañas.',
    'Tu versión Radiant está mirando. Demuéstrale de qué estás hecho.',
];

// Facilitator Prompts — Reductionist, monk whisper tone
const FACILITATOR_PROMPTS = [
    'No hagas toda la rutina. Solo abre el libro y lee 1 párrafo. Literalmente 1.',
    'La barrera mental es el enemigo real. Solo ponte las zapatillas. Nada más.',
    'Solo 2 minutos. Si después quieres parar, está bien. Pero empieza.',
    'No necesitas perfección. Necesitas presencia. Solo aparece.',
    'Un paso diminuto hoy vale más que cien planes para mañana.',
    'Hazlo feo, hazlo rápido, pero hazlo. La calidad viene con la repetición.',
];

/** Get a notification prompt for a specific habit context */
export function getPrompt(effortLevel: number, baseMotivation: number): {
    type: PromptType;
    message: string;
} {
    const type = classifyPromptType(effortLevel, baseMotivation);
    const pool = type === 'spark' ? SPARK_PROMPTS : FACILITATOR_PROMPTS;
    return {
        type,
        message: pool[Math.floor(Math.random() * pool.length)],
    };
}

// Daily Welcome Quotes
const WELCOME_QUOTES = [
    'El primer paso es el más valioso.',
    'Hoy es otro día para construir tu legado.',
    'La constancia silenciosa derrota al talento ruidoso.',
    'Cada día que eliges crecer, ganas.',
    'Tu futuro comienza en los próximos 5 minutos.',
    'No cuentes los días. Haz que los días cuenten.',
    'La disciplina es libertad disfrazada.',
    'Pequeñas victorias diarias crean transformaciones épicas.',
];

// End-of-day triumph quotes
const TRIUMPH_QUOTES = [
    '¡Día conquistado! El esfuerzo brutal dio frutos.',
    'Todas las metas cumplidas. Hoy fuiste imparable.',
    'Tu versión de ayer estaría orgullosa de lo que lograste hoy.',
    'Cerraste el día como un campeón. Descansa como uno también.',
];

// End-of-day patience quotes
const PATIENCE_QUOTES = [
    'Hoy no fue la coronación, pero fue la resistencia necesaria.',
    'Mañana es un ciclo en blanco. Duerme y perdona.',
    'Los días difíciles son los que más enseñan. Descansa.',
    'No todos los días serán perfectos. Lo importante es que seguiste aquí.',
];

export function getWelcomeQuote(): string {
    return WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)];
}

export function getTriumphQuote(): string {
    return TRIUMPH_QUOTES[Math.floor(Math.random() * TRIUMPH_QUOTES.length)];
}

export function getPatienceQuote(): string {
    return PATIENCE_QUOTES[Math.floor(Math.random() * PATIENCE_QUOTES.length)];
}
