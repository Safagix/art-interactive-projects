import { PERSONAL_CALIBRATION_VERSION, type ActivityEntry, type Badge, type DailyClosure, type Skill, type SubDivision, type TimeBlockTemplate, type UserProfile } from '@/types';
import { getRankFromXP, getTotalXPUpTo } from '@/services/RankEngine';

type CalibratedSkill = Omit<Skill, 'currentXP' | 'rank' | 'subDivision' | 'lastTrainedAt' | 'createdAt'> & {
    xp: number;
};

function xpAt(rank: Skill['rank'], sub: SubDivision, progress = 0.2): number {
    const start = getTotalXPUpTo(rank, sub);
    const info = getRankFromXP(start);
    return Math.round(start + info.xpForCurrentSub * progress);
}

export const PERSONAL_CATEGORIES = [
    'Mente',
    'Cuerpo',
    'Carrera',
    'Relaciones',
    'Recursos',
    'Expresión',
    'Espíritu',
];

export const PERSONAL_SKILLS: CalibratedSkill[] = [
    {
        id: 'skill-mental',
        name: 'Claridad mental',
        icon: '☀️',
        category: 'Mente',
        xp: xpAt('Platinum', 1, 0.18),
        decayDays: 21,
        synergies: [
            { targetSkillId: 'skill-discipline', multiplier: 0.12, description: 'La claridad sostiene la disciplina.' },
            { targetSkillId: 'skill-study', multiplier: 0.08, description: 'Mejor autoconocimiento mejora el estudio.' },
        ],
    },
    {
        id: 'skill-discipline',
        name: 'Disciplina',
        icon: '🧭',
        category: 'Mente',
        xp: xpAt('Silver', 3, 0.72),
        decayDays: 10,
        synergies: [
            { targetSkillId: 'skill-health', multiplier: 0.1, description: 'La constancia diaria fortalece el cuerpo.' },
            { targetSkillId: 'skill-ai-freelancer', multiplier: 0.08, description: 'La acción sostenida destraba ventas.' },
        ],
    },
    {
        id: 'skill-health',
        name: 'Salud y energía',
        icon: '💪',
        category: 'Cuerpo',
        xp: xpAt('Gold', 1, 0.62),
        decayDays: 7,
        synergies: [
            { targetSkillId: 'skill-mental', multiplier: 0.08, description: 'Ejercicio diario estabiliza energía y ánimo.' },
        ],
    },
    {
        id: 'skill-faculty',
        name: 'Facultad',
        icon: '🎓',
        category: 'Carrera',
        xp: xpAt('Gold', 1, 0.78),
        decayDays: 14,
        synergies: [
            { targetSkillId: 'skill-study', multiplier: 0.12, description: 'La beca y el promedio empujan el estudio.' },
            { targetSkillId: 'skill-technical', multiplier: 0.06, description: 'La carrera alimenta base técnica.' },
        ],
    },
    {
        id: 'skill-study',
        name: 'Estudio autónomo',
        icon: '📚',
        category: 'Mente',
        xp: xpAt('Silver', 2, 0.55),
        decayDays: 10,
        synergies: [
            { targetSkillId: 'skill-technical', multiplier: 0.08, description: 'Mejor método de estudio acelera programación.' },
        ],
    },
    {
        id: 'skill-technical',
        name: 'Programación real',
        icon: '💻',
        category: 'Carrera',
        xp: xpAt('Silver', 1, 0.12),
        decayDays: 10,
        synergies: [
            { targetSkillId: 'skill-ai-freelancer', multiplier: 0.1, description: 'La técnica vuelve vendibles los servicios.' },
        ],
    },
    {
        id: 'skill-ai-freelancer',
        name: 'AI Freelancer',
        icon: '💼',
        category: 'Carrera',
        xp: xpAt('Bronze', 1, 0.45),
        decayDays: 5,
        synergies: [
            { targetSkillId: 'skill-career', multiplier: 0.15, description: 'Cada acción comercial mejora carrera.' },
        ],
    },
    {
        id: 'skill-career',
        name: 'Carrera profesional',
        icon: '🚀',
        category: 'Carrera',
        xp: xpAt('Bronze', 2, 0.35),
        decayDays: 7,
        synergies: [
            { targetSkillId: 'skill-finance', multiplier: 0.08, description: 'Vender servicios mejora salud financiera.' },
        ],
    },
    {
        id: 'skill-languages',
        name: 'Idiomas',
        icon: '🗣️',
        category: 'Mente',
        xp: xpAt('Silver', 1, 0.6),
        decayDays: 6,
        synergies: [
            { targetSkillId: 'skill-study', multiplier: 0.06, description: 'Idiomas fortalecen memoria y aprendizaje.' },
        ],
    },
    {
        id: 'skill-social',
        name: 'Comunicación social',
        icon: '🤝',
        category: 'Relaciones',
        xp: xpAt('Silver', 1, 0.42),
        decayDays: 14,
        synergies: [
            { targetSkillId: 'skill-ai-freelancer', multiplier: 0.08, description: 'Socializar facilita vender y presentarse.' },
        ],
    },
    {
        id: 'skill-creative',
        name: 'Creatividad aplicada',
        icon: '🎨',
        category: 'Expresión',
        xp: xpAt('Silver', 1, 0.58),
        decayDays: 14,
        synergies: [
            { targetSkillId: 'skill-technical', multiplier: 0.05, description: 'Crear ideas alimenta proyectos reales.' },
        ],
    },
    {
        id: 'skill-finance',
        name: 'Finanzas personales',
        icon: '💰',
        category: 'Recursos',
        xp: xpAt('Bronze', 2, 0.35),
        decayDays: 21,
        synergies: [],
    },
    {
        id: 'skill-spirit',
        name: 'Sentido y espiritualidad',
        icon: '🕯️',
        category: 'Espíritu',
        xp: xpAt('Silver', 1, 0.55),
        decayDays: 21,
        synergies: [
            { targetSkillId: 'skill-mental', multiplier: 0.06, description: 'Sentido y valores estabilizan la mente.' },
        ],
    },
];

export const PERSONAL_TIMELINE_CLOSURES: DailyClosure[] = [
    { date: '2025-03-01', consistencyScore: 3, habitsTotal: 4, habitsCompleted: 3, sleepHours: 8, closureType: 'triumph' },
    { date: '2025-07-15', consistencyScore: 3, habitsTotal: 5, habitsCompleted: 4, sleepHours: 8, closureType: 'triumph' },
    { date: '2025-12-15', consistencyScore: 4, habitsTotal: 5, habitsCompleted: 4, sleepHours: 8, closureType: 'triumph' },
    { date: '2026-04-16', consistencyScore: 3, habitsTotal: 6, habitsCompleted: 4, sleepHours: 7.5, closureType: 'triumph' },
];

export const PERSONAL_ACTIVITY_LOG: ActivityEntry[] = [
    { date: '2025-03-01', xpGained: 450, tasksCompleted: 3 },
    { date: '2025-07-15', xpGained: 650, tasksCompleted: 4 },
    { date: '2025-12-15', xpGained: 900, tasksCompleted: 5 },
    { date: '2026-04-16', xpGained: 520, tasksCompleted: 4 },
];

export const PERSONAL_BADGES: Badge[] = [
    {
        id: 'badge-itaipu-scholarship',
        name: 'Beca Itaipu',
        description: 'Carrera financiada mientras sostiene promedio minimo 3.0.',
        icon: '🎓',
        unlockedAt: '2025-03-01T12:00:00.000Z',
    },
    {
        id: 'badge-average-43',
        name: 'Promedio 4.3',
        description: 'Cerro 2025 con promedio anual 4.3 entre ambos semestres.',
        icon: '⭐',
        unlockedAt: '2025-12-15T12:00:00.000Z',
    },
    {
        id: 'badge-pushups-11-months',
        name: '11 meses de flexiones',
        description: 'Construyo constancia fisica con 100 flexiones diarias.',
        icon: '💪',
        unlockedAt: '2025-12-16T12:00:00.000Z',
    },
    {
        id: 'badge-jlpt-n4',
        name: 'JLPT N4',
        description: 'Base real de japones validada antes de ProfessionalStats.',
        icon: '🗾',
        unlockedAt: '2025-01-01T12:00:00.000Z',
    },
    {
        id: 'badge-ore-pizzeria-deploy',
        name: 'Ore Pizzeria Deploy',
        description: 'Demo real desplegada en Vercel para gestion de pizzeria.',
        icon: '🍕',
        unlockedAt: '2026-04-23T12:00:00.000Z',
    },
    {
        id: 'badge-digital-lab-builder',
        name: 'Digital Lab Builder',
        description: 'Convirtio vibecoding en un laboratorio personal de aprendizaje.',
        icon: '🧪',
        unlockedAt: '2026-05-01T12:00:00.000Z',
    },
];

export const PERSONAL_NOTES = `Base calibrada desde tus respuestas:
- 2025: inicio de facultad, beca Itaipu, promedio anual 4.3, más socialización y primer estudio real.
- Físico: 100 flexiones diarias desde 16/12/2024, 11 meses fuertes, reinicio en abril 2026.
- Mental: salto grande en autoconocimiento, regulación emocional, paz + vitalidad.
- Técnico: base académica Python/Java y muchos proyectos con IA, pero poca autonomía sin IA.
- Carrera/AI Freelancer: Ore Pizzeria/demo y primeros contactos, falta portfolio, cotización y entrega con seguridad.
- Prioridad 3 meses: conseguir trabajo; 6 meses: ganar plata y sostener beca.`;

export function buildPersonalSkills(nowIso = new Date().toISOString()): Skill[] {
    return PERSONAL_SKILLS.map((skill) => {
        const rank = getRankFromXP(skill.xp);
        return {
            id: skill.id,
            name: skill.name,
            icon: skill.icon,
            category: skill.category,
            currentXP: skill.xp,
            rank: rank.rank,
            subDivision: rank.subDivision,
            decayDays: skill.decayDays,
            lastTrainedAt: nowIso,
            synergies: skill.synergies,
            createdAt: nowIso,
        };
    });
}

export function applyPersonalCalibration(profile: UserProfile, nowIso = new Date().toISOString()): UserProfile {
    const calibratedSkills = buildPersonalSkills(nowIso);
    const skills = mergeAuthoritativeSkills(calibratedSkills, profile.skills, nowIso);
    const overallXP = skills.reduce((sum, skill) => sum + skill.currentXP, 0);

    return {
        ...profile,
        calibrationVersion: PERSONAL_CALIBRATION_VERSION,
        categories: mergeUnique(PERSONAL_CATEGORIES, profile.categories),
        skills,
        badges: mergeById(PERSONAL_BADGES, profile.badges),
        dailyClosures: mergeByDate(PERSONAL_TIMELINE_CLOSURES, profile.dailyClosures),
        activityLog: mergeActivity(PERSONAL_ACTIVITY_LOG, profile.activityLog),
        visionBoardProgress: {
            Autoconocimiento: 72,
            Salud: 58,
            Trabajo_IA: 28,
            Beca_Itaipu: 86,
            ...(profile.visionBoardProgress ?? {}),
        },
        overallXP,
        totalLevel: Math.max(3, Math.min(6, Math.floor(overallXP / 22000) + 1)),
        title: 'Becado Itaipu · Builder en progreso',
        longestStreak: Math.max(profile.longestStreak || 0, 4),
        currentStreak: Math.max(profile.currentStreak || 0, 1),
        lastLoginAt: nowIso,
        createdAt: profile.createdAt || '2025-03-01T08:00:00.000Z',
    };
}

export function mergePersonalScheduleNotes(schedule: TimeBlockTemplate[]): TimeBlockTemplate[] {
    return schedule.map((block) => {
        if (block.id === 'deep-work') {
            return {
                ...block,
                title: 'Estudio profundo / trabajo vendible',
                description: 'Primero facultad si hay presión; si no, portfolio, demo u outreach AI Freelancer.',
            };
        }
        if (block.id === 'exercise-shower') {
            return {
                ...block,
                description: '100 flexiones base. Próximo upgrade: dominadas, mancuernas y piernas.',
            };
        }
        if (block.id === 'light-study-duolingo') {
            return {
                ...block,
                description: 'Lectura, método de estudio, Duolingo o japonés liviano.',
            };
        }
        return block;
    });
}

function mergeAuthoritativeSkills(calibrated: Skill[], existing: Skill[], nowIso: string): Skill[] {
    const personalIds = new Set(calibrated.map((skill) => skill.id));
    const byId = new Map(calibrated.map((skill) => [skill.id, skill]));

    for (const skill of existing ?? []) {
        const mappedId = mapLegacySkillId(skill);
        const calibratedSkill = byId.get(mappedId);

        if (calibratedSkill) {
            const shouldUseCalibration = skill.currentXP <= 0 || skill.rank === 'Iron';
            const currentXP = shouldUseCalibration ? calibratedSkill.currentXP : Math.max(skill.currentXP, calibratedSkill.currentXP);
            const rankInfo = getRankFromXP(currentXP);
            byId.set(mappedId, {
                ...calibratedSkill,
                ...(!shouldUseCalibration ? skill : {}),
                id: calibratedSkill.id,
                name: calibratedSkill.name,
                icon: calibratedSkill.icon,
                category: calibratedSkill.category,
                currentXP,
                rank: rankInfo.rank,
                subDivision: rankInfo.subDivision,
                synergies: calibratedSkill.synergies,
                lastTrainedAt: nowIso,
            });
            continue;
        }

        if (!personalIds.has(skill.id) && skill.currentXP > 0) {
            const rankInfo = getRankFromXP(skill.currentXP);
            byId.set(skill.id, {
                ...skill,
                rank: rankInfo.rank,
                subDivision: rankInfo.subDivision,
                lastTrainedAt: skill.lastTrainedAt || nowIso,
            });
        }
    }

    return Array.from(byId.values());
}

function mapLegacySkillId(skill: Skill): string {
    const normalized = skill.name.trim().toLowerCase();
    if (skill.id === 'skill-ai-freelancer' || normalized === 'ai freelancer') return 'skill-ai-freelancer';
    if (skill.id === 'skill-health' || normalized === 'salud y energía' || normalized === 'salud y energia') return 'skill-health';
    if (skill.id === 'skill-languages' || normalized === 'idiomas') return 'skill-languages';
    if (skill.id === 'skill-study' || normalized === 'facultad y estudio') return 'skill-study';
    return skill.id;
}

function mergeUnique(first: string[], second: string[] = []): string[] {
    return Array.from(new Set([...first, ...second]));
}

function mergeById<T extends { id: string }>(first: T[], second: T[] = []): T[] {
    const byId = new Map(first.map((item) => [item.id, item]));
    for (const item of second) byId.set(item.id, item);
    return Array.from(byId.values());
}

function mergeByDate<T extends { date: string }>(first: T[], second: T[] = []): T[] {
    const byDate = new Map(first.map((item) => [item.date, item]));
    for (const item of second) byDate.set(item.date, item);
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function mergeActivity(first: ActivityEntry[], second: ActivityEntry[] = []): ActivityEntry[] {
    return mergeByDate(first, second);
}
