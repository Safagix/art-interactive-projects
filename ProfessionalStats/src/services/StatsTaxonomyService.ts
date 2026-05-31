import type { Skill, StatCategory } from '@/types';

export const CORE_PILLARS = [
    'Mente',
    'Cuerpo',
    'Carrera',
    'Relaciones',
    'Recursos',
    'Expresión',
    'Espíritu',
] as const;

export type CorePillar = (typeof CORE_PILLARS)[number];

export const PILLAR_DESCRIPTIONS: Record<CorePillar, string> = {
    Mente: 'Claridad, disciplina, estudio, regulación emocional y capacidad de pensar con calma.',
    Cuerpo: 'Salud física, fuerza, energía, sueño, alimentación y constancia de entrenamiento.',
    Carrera: 'Facultad, programación, AI Freelancer, portfolio, empleabilidad y trabajo vendible.',
    Relaciones: 'Comunicación, amistades, confianza social, networking y capacidad de presentarte.',
    Recursos: 'Dinero, ahorro, herramientas, oportunidades, equipo y gestión material de tu vida.',
    Expresión: 'Creatividad, revista digital, diseño, ropa, proyectos personales y construcción de identidad.',
    Espíritu: 'Sentido, valores, paz interior, gratitud, fe, meditación y conexión con la persona que querés ser.',
};

const CATEGORY_TO_PILLAR: Record<string, CorePillar> = {
    Mente: 'Mente',
    Mental: 'Mente',
    Disciplina: 'Mente',
    Educación: 'Mente',
    Idiomas: 'Mente',
    Cuerpo: 'Cuerpo',
    Físico: 'Cuerpo',
    Carrera: 'Carrera',
    Facultad: 'Carrera',
    Técnico: 'Carrera',
    'AI Freelancer': 'Carrera',
    Relaciones: 'Relaciones',
    Social: 'Relaciones',
    Recursos: 'Recursos',
    Finanzas: 'Recursos',
    Expresión: 'Expresión',
    Hobbies: 'Expresión',
    Creativo: 'Expresión',
    Espiritual: 'Espíritu',
    Espíritu: 'Espíritu',
};

export function getPillarForCategory(category: StatCategory): CorePillar {
    return CATEGORY_TO_PILLAR[category] ?? 'Mente';
}

export function getPillarForSkill(skill: Skill): CorePillar {
    return getPillarForCategory(skill.category);
}

export function getPillarXP(skills: Skill[], pillar: CorePillar): number {
    return skills
        .filter((skill) => getPillarForSkill(skill) === pillar)
        .reduce((sum, skill) => sum + skill.currentXP, 0);
}

export function getPillarScore(skills: Skill[], pillar: CorePillar): number {
    const pillarSkills = skills.filter((skill) => getPillarForSkill(skill) === pillar);
    if (pillarSkills.length === 0) return 0;

    const averageXP = getPillarXP(skills, pillar) / pillarSkills.length;
    const score = Math.round((averageXP / 12000) * 100);
    return Math.max(8, Math.min(100, score));
}
