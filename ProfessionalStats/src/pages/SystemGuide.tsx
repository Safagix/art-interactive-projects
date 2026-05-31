import { BookOpen, CircleHelp } from 'lucide-react';
import { CORE_PILLARS, PILLAR_DESCRIPTIONS } from '@/services/StatsTaxonomyService';

const RANKS = [
    ['Iron', 'Recién empieza o todavía no hay evidencia suficiente.'],
    ['Bronze', 'Base real, pero falta constancia o autonomía.'],
    ['Silver', 'Competente con evidencia, aunque todavía irregular.'],
    ['Gold', 'Fuerte y probado en la vida real.'],
    ['Platinum', 'Fortaleza distintiva y sostenida.'],
    ['Diamond+', 'Dominio excepcional con evidencia repetida.'],
];

export function SystemGuide() {
    return (
        <div className="page-content system-guide-page">
            <div className="glass-card system-guide-hero">
                <CircleHelp size={28} style={{ color: 'var(--color-aero-blue)' }} />
                <div>
                    <h1>Cómo leer ProfessionalStats</h1>
                    <p>
                        Esto no mide cuánto valés. Mide evidencia, constancia y dirección para que sepas qué entrenar.
                    </p>
                </div>
            </div>

            <section className="glass-card system-guide-section">
                <h2 className="section-title">Pilares fundamentales</h2>
                <div className="system-guide-grid">
                    {CORE_PILLARS.map((pillar) => (
                        <article key={pillar} className="system-guide-card">
                            <h3>{pillar}</h3>
                            <p>{PILLAR_DESCRIPTIONS[pillar]}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="glass-card system-guide-section">
                <h2 className="section-title">Rangos</h2>
                <div className="system-guide-ranks">
                    {RANKS.map(([rank, description]) => (
                        <div key={rank}>
                            <strong>{rank}</strong>
                            <span>{description}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="glass-card system-guide-section">
                <h2 className="section-title">Nivel, XP y progreso</h2>
                <p>
                    El nivel total resume tu perfil completo, pero no es una suma literal de todo lo que sos.
                    El XP sube con acciones reales: cerrar días, cumplir hábitos, aprobar, entrenar, vender,
                    crear proyectos, estudiar y exponerte a oportunidades.
                </p>
                <div className="system-guide-principles">
                    <span><BookOpen size={14} /> Skill = entrenamiento específico</span>
                    <span><BookOpen size={14} /> Pilar = grupo grande de skills</span>
                    <span><BookOpen size={14} /> Rango = evidencia acumulada</span>
                </div>
            </section>
        </div>
    );
}
