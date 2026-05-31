import type {
    DailyRecord,
    Habit,
    HabitCompletionState,
    Mission,
    Skill,
    TimeBlockTemplate,
    TodayBlock,
    UserProfile,
    WeekdayKey,
} from '@/types';
import { getCurrentMinutes, getLocalDateKey, getWeekdayKey, minutesFromTime } from '@/services/DateService';
import { getRankFromXP } from '@/services/RankEngine';
import { PERSONAL_CATEGORIES, buildPersonalSkills } from '@/services/PersonalCalibrationService';

const FACULTY_DAYS: WeekdayKey[] = ['monday', 'wednesday', 'thursday', 'friday'];

export const DEFAULT_CATEGORIES = [
    ...PERSONAL_CATEGORIES,
];

export const DEFAULT_SCHEDULE_TEMPLATES: TimeBlockTemplate[] = [
    { id: 'wake-breakfast', title: 'Despertar + desayuno', description: 'Higiene, agua, desayuno y preparar el foco del día.', start: '08:00', end: '09:00', category: 'Mental', kind: 'routine' },
    { id: 'deep-work', title: 'Estudio/trabajo profundo', description: 'Bloque principal para avanzar trabajo, universidad o AI Freelancer.', start: '09:00', end: '12:00', category: 'Carrera', kind: 'roadmap' },
    { id: 'lunch', title: 'Almuerzo', description: 'Cortar de verdad, comer y alejarse de la pantalla.', start: '12:00', end: '13:00', category: 'Físico', kind: 'recovery' },
    { id: 'rest', title: 'Descanso', description: 'Una hora de recuperación sin culpa.', start: '13:00', end: '14:00', category: 'Mental', kind: 'recovery' },
    { id: 'light-study-duolingo', title: 'Estudio ligero / lectura / Duolingo', description: 'Lectura, repaso liviano o mini sesión diaria de Duolingo.', start: '14:00', end: '15:00', category: 'Educación', kind: 'habit' },
    { id: 'exercise-shower', title: 'Ejercicio + baño', description: 'Entrenar, bañarse y resetear energía.', start: '15:00', end: '16:00', category: 'Físico', kind: 'habit' },
    { id: 'prepare-bag', title: 'Prepararse y ordenar mochila', description: 'Ropa, materiales, agua y salida sin apuro.', start: '16:00', end: '16:30', category: 'Educación', kind: 'routine', weekdays: FACULTY_DAYS },
    { id: 'faculty-commute', title: 'Traslado / facultad', description: 'Bloque reservado para salida, clases y vuelta a casa.', start: '16:30', end: '23:00', category: 'Educación', kind: 'class', weekdays: FACULTY_DAYS },
    { id: 'day-close', title: 'Cierre del día + sueño', description: 'Marcar progreso, preparar mañana y bajar revoluciones.', start: '23:00', end: '23:30', category: 'Mental', kind: 'routine', weekdays: FACULTY_DAYS },
    { id: 'freelance-evening', title: 'Bloque AI Freelancer', description: 'Outreach, demo, portfolio o aprendizaje de venta.', start: '16:30', end: '18:30', category: 'Carrera', kind: 'roadmap', weekdays: ['tuesday', 'saturday', 'sunday'] },
    { id: 'free-evening-close', title: 'Cierre y ocio ligero', description: 'Ordenar el día, Duolingo si falta y descanso.', start: '21:30', end: '22:30', category: 'Mental', kind: 'routine', weekdays: ['tuesday', 'saturday', 'sunday'] },
    { id: 'class-mon-it3', title: 'Informática 3', description: 'Clase de facultad.', start: '18:15', end: '20:30', category: 'Educación', kind: 'class', weekdays: ['monday'], location: 'Aula 102' },
    { id: 'class-mon-math3', title: 'Matemática 3', description: 'Clase de facultad.', start: '20:40', end: '22:10', category: 'Educación', kind: 'class', weekdays: ['monday'], location: 'Aula 102' },
    { id: 'class-wed-math3', title: 'Matemática 3', description: 'Clase de facultad.', start: '18:15', end: '20:30', category: 'Educación', kind: 'class', weekdays: ['wednesday'], location: 'Aula 106' },
    { id: 'class-wed-prog3', title: 'Programación 3', description: 'Clase de facultad.', start: '20:40', end: '22:10', category: 'Técnico', kind: 'class', weekdays: ['wednesday'], location: 'Laboratorio 4' },
    { id: 'class-thu-it3-lab', title: 'Informática 3 lab', description: 'Clase de facultad.', start: '18:15', end: '19:45', category: 'Educación', kind: 'class', weekdays: ['thursday'], location: 'Laboratorio 3' },
    { id: 'class-thu-socio', title: 'Introducción a la Sociología', description: 'Clase de facultad.', start: '19:55', end: '21:25', category: 'Educación', kind: 'class', weekdays: ['thursday'], location: 'Aula 103' },
    { id: 'class-fri-anthro', title: 'Antropología Cristiana', description: 'Clase de facultad.', start: '18:15', end: '19:45', category: 'Educación', kind: 'class', weekdays: ['friday'], location: 'Auditorio 105' },
    { id: 'class-fri-prog3', title: 'Programación 3', description: 'Clase de facultad.', start: '20:40', end: '22:10', category: 'Técnico', kind: 'class', weekdays: ['friday'], location: 'Laboratorio 1' },
];

export function getDefaultSkills(nowIso = new Date().toISOString()): Skill[] {
    return buildPersonalSkills(nowIso);
}

export function getDefaultHabits(nowIso = new Date().toISOString()): Habit[] {
    return [
        createSeedHabit('habit-duolingo', 'Duolingo diario', '🟩', 'Educación', 2, 3, ['Idiomas'], nowIso),
        createSeedHabit('habit-exercise', 'Ejercicio', '💪', 'Físico', 7, 6, ['Salud'], nowIso),
        createSeedHabit('habit-day-close', 'Cerrar el día', '🌙', 'Mental', 3, 4, ['Constancia'], nowIso),
        createSeedHabit('habit-ai-freelancer', 'Bloque AI Freelancer', '💼', 'Carrera', 8, 7, ['Trabajo_IA'], nowIso),
        createSeedHabit('habit-reading', 'Lectura / estudio ligero', '📖', 'Educación', 4, 4, ['Aprendizaje'], nowIso),
    ];
}

export function getDefaultMissions(nowIso = new Date().toISOString()): Mission[] {
    return [
        createSeedMission('mission-outreach', 'Contactar 3 negocios locales', 'Enviar mensajes o hablar con posibles clientes para validar necesidad.', 120, 'weekly', 'skill-ai-freelancer', nowIso),
        createSeedMission('mission-demo', 'Mejorar una demo de portfolio', 'Avanzar una demo vendible: web, dashboard, chatbot o automatización.', 150, 'weekly', 'skill-ai-freelancer', nowIso),
        createSeedMission('mission-next-supabase', 'Practicar Next.js + Supabase', 'Construir o repasar una pieza reusable para sistemas de gestión.', 100, 'weekly', 'skill-ai-freelancer', nowIso),
        createSeedMission('mission-automation', 'Crear una automatización IA', 'Probar n8n, webhook, chatbot o flujo para negocio real.', 100, 'weekly', 'skill-ai-freelancer', nowIso),
        createSeedMission('mission-proposal', 'Preparar propuesta comercial', 'Dejar lista una oferta concreta con precio, alcance y tiempo.', 80, 'weekly', 'skill-ai-freelancer', nowIso),
    ];
}

export function createDailyRecord(date = getLocalDateKey(), sleepHours = 7): DailyRecord {
    return {
        date,
        sleepHours,
        habitStates: {},
        scheduleStates: {},
        notes: '',
        closedAt: null,
        consistencyScore: 0,
        xpGained: 0,
    };
}

export function getDailyRecord(profile: UserProfile, date = getLocalDateKey()): DailyRecord {
    return profile.dailyRecords?.[date] ?? createDailyRecord(date, profile.sleepHoursToday || 7);
}

export function getTodayBlocks(profile: UserProfile, dateObj: Date = new Date()): TodayBlock[] {
    const weekday = getWeekdayKey(dateObj);
    const record = getDailyRecord(profile, getLocalDateKey(dateObj));

    return (profile.scheduleTemplates || DEFAULT_SCHEDULE_TEMPLATES)
        .filter((block) => !block.weekdays || block.weekdays.includes(weekday))
        .map((block) => ({
            ...block,
            state: record.scheduleStates[block.id] ?? 'pending',
        }))
        .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start));
}

export function getCurrentAndNextBlocks(blocks: TodayBlock[], now = new Date()) {
    const currentMinutes = getCurrentMinutes(now);
    const current = blocks.find((block) => {
        const start = minutesFromTime(block.start);
        const end = minutesFromTime(block.end);
        return currentMinutes >= start && currentMinutes < end;
    }) ?? null;

    const next = blocks.find((block) => minutesFromTime(block.start) > currentMinutes) ?? null;
    return { current, next };
}

export function getRoadmapFocus(dateObj: Date = new Date()): string {
    const weekday = getWeekdayKey(dateObj);
    const focus: Record<WeekdayKey, string> = {
        monday: 'AI Freelancer: outreach corto antes de facultad o preparar lista de clientes.',
        tuesday: 'AI Freelancer: bloque fuerte para portfolio/demo y propuesta vendible.',
        wednesday: 'AI Freelancer: seguimiento ligero; prioridad facultad y repaso técnico.',
        thursday: 'AI Engineer + facultad: repaso técnico y lectura antes de salir.',
        friday: 'AI Freelancer: cerrar avances, enviar propuestas y revisar respuestas.',
        saturday: 'AI Engineer: aprendizaje profundo y construcción de activos.',
        sunday: 'Plan semanal: revisar métricas, preparar outreach y ordenar tareas.',
    };
    return focus[weekday];
}

export function calculateDailyScore(record: DailyRecord, habits: Habit[], blocks: TodayBlock[]) {
    const habitPoints = habits.reduce((sum, habit) => {
        const state = record.habitStates[habit.id] ?? 'null';
        if (state === 'complete') return sum + 1;
        if (state === 'partial') return sum + 0.65;
        if (state === 'almost_null') return sum + 0.25;
        return sum;
    }, 0);

    const blockPoints = blocks.reduce((sum, block) => {
        const state = record.scheduleStates[block.id] ?? 'pending';
        if (state === 'done') return sum + 1;
        if (state === 'partial') return sum + 0.55;
        return sum;
    }, 0);

    const total = habits.length + blocks.length;
    if (total === 0) return { score: 0, xp: 0, tasksCompleted: 0 };

    const raw = (habitPoints + blockPoints) / total;
    const score = Math.min(4, Math.round(raw * 4));
    const tasksCompleted = habits.filter((habit) => record.habitStates[habit.id] === 'complete').length
        + blocks.filter((block) => record.scheduleStates[block.id] === 'done').length;
    const xp = Math.round(habitPoints * 20 + blockPoints * 10);

    return { score, xp, tasksCompleted };
}

function createSeedSkill(id: string, name: string, icon: string, category: string, nowIso: string): Skill {
    const rankInfo = getRankFromXP(0);
    return {
        id,
        name,
        icon,
        category,
        currentXP: 0,
        rank: rankInfo.rank,
        subDivision: rankInfo.subDivision,
        decayDays: 14,
        lastTrainedAt: nowIso,
        synergies: [],
        createdAt: nowIso,
    };
}

function createSeedHabit(
    id: string,
    name: string,
    icon: string,
    category: string,
    effortLevel: number,
    baseMotivation: number,
    visionBoardTags: string[],
    nowIso: string
): Habit {
    return {
        id,
        name,
        icon,
        category,
        effortLevel,
        baseMotivation,
        visionBoardTags,
        completionState: 'null',
        isDaily: true,
        createdAt: nowIso,
    };
}

function createSeedMission(
    id: string,
    title: string,
    description: string,
    xpReward: number,
    type: Mission['type'],
    skillId: string,
    nowIso: string
): Mission {
    return {
        id,
        title,
        description,
        xpReward,
        type,
        skillId,
        status: 'active',
        createdAt: nowIso,
        completedAt: null,
    };
}
