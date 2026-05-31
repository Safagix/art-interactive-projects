// =============================================================================
// SettingsPage — Configuration, skill management, export/import, reset
// =============================================================================

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Trash2, Download, Upload, RotateCcw, AlertTriangle, X, Sparkles } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { applyCalibrationToProfile, clearProfile, createDefaultProfile, saveProfile, validateProfileImport } from '@/services/StorageService';
import type { TimeBlockTemplate } from '@/types';

export function SettingsPage() {
    const { profile, dispatch, removeSkill, addCategory, removeCategory, renameCategory } = useProfile();
    const [showReset, setShowReset] = useState(false);

    // Category management states
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState('');

    const [importStatus, setImportStatus] = useState<string | null>(null);
    const [calibrationStatus, setCalibrationStatus] = useState<string | null>(null);
    const [scheduleDraft, setScheduleDraft] = useState('');
    const [scheduleStatus, setScheduleStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setScheduleDraft(JSON.stringify(profile.scheduleTemplates, null, 2));
    }, [profile.scheduleTemplates]);

    // Export profile as JSON
    const handleExport = () => {
        const json = JSON.stringify(profile, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `professionalstats_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import profile from JSON
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = validateProfileImport(JSON.parse(ev.target?.result as string));
                if (data) {
                    dispatch({ type: 'LOAD_PROFILE', payload: data });
                    saveProfile(data);
                    setImportStatus('Perfil importado correctamente');
                    setTimeout(() => setImportStatus(null), 3000);
                } else {
                    setImportStatus('Archivo inválido');
                    setTimeout(() => setImportStatus(null), 3000);
                }
            } catch {
                setImportStatus('Error al leer el archivo');
                setTimeout(() => setImportStatus(null), 3000);
            }
        };
        reader.readAsText(file);
    };

    const handleApplySchedule = () => {
        try {
            const parsed = JSON.parse(scheduleDraft) as TimeBlockTemplate[];
            const isValid = Array.isArray(parsed)
                && parsed.every((item) => item.id && item.title && item.start && item.end && item.category && item.kind);
            if (!isValid) {
                setScheduleStatus('Horario inválido: cada bloque necesita id, title, start, end, category y kind.');
                return;
            }
            dispatch({ type: 'SET_PROFILE', payload: { scheduleTemplates: parsed } });
            setScheduleStatus('Horario actualizado');
            setTimeout(() => setScheduleStatus(null), 3000);
        } catch {
            setScheduleStatus('JSON inválido');
        }
    };

    const handleApplyPersonalCalibration = () => {
        const calibrated = applyCalibrationToProfile(profile);
        dispatch({ type: 'LOAD_PROFILE', payload: calibrated });
        saveProfile(calibrated);
        setCalibrationStatus('Calibración personal aplicada');
        setTimeout(() => setCalibrationStatus(null), 3000);
    };

    // Reset all progress
    const handleReset = () => {
        const fresh = createDefaultProfile();
        clearProfile();
        dispatch({ type: 'LOAD_PROFILE', payload: fresh });
        setShowReset(false);
    };

    return (
        <div className="page-content">
            <h2 className="section-title flex items-center gap-2 mb-5">
                <Settings size={14} /> Configuración
            </h2>

            {/* Categories Management */}
            <div className="glass-card p-5 mb-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Categorías de Vida (Radar)
                </h3>

                {/* Add new category */}
                <div className="flex gap-2 mb-4">
                    <input
                        className="glass-input flex-1 !py-1.5"
                        placeholder="Nueva categoría (ej: Finanzas, Guitarra...)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newCategoryName.trim()) {
                                addCategory(newCategoryName.trim());
                                setNewCategoryName('');
                            }
                        }}
                    />
                    <button
                        className="glass-btn glass-btn-primary !py-1.5"
                        onClick={() => {
                            if (newCategoryName.trim()) {
                                addCategory(newCategoryName.trim());
                                setNewCategoryName('');
                            }
                        }}
                    >
                        Añadir
                    </button>
                </div>

                {/* List categories */}
                <div className="flex flex-wrap gap-2">
                    {profile.categories.map((cat) => (
                        <div
                            key={cat}
                            className="flex items-center gap-2 p-1.5 px-3 rounded-full text-xs"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            {editingCategory === cat ? (
                                <input
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-xs w-20"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    onBlur={() => {
                                        if (editCategoryName.trim() && editCategoryName !== cat) {
                                            renameCategory(cat, editCategoryName.trim());
                                        }
                                        setEditingCategory(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (editCategoryName.trim() && editCategoryName !== cat) {
                                                renameCategory(cat, editCategoryName.trim());
                                            }
                                            setEditingCategory(null);
                                        } else if (e.key === 'Escape') {
                                            setEditingCategory(null);
                                        }
                                    }}
                                />
                            ) : (
                                <span
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setEditingCategory(cat);
                                        setEditCategoryName(cat);
                                    }}
                                    title="Click para editar"
                                >
                                    {cat}
                                </span>
                            )}

                            <button
                                className="opacity-50 hover:opacity-100 transition-opacity ml-1"
                                onClick={() => removeCategory(cat)}
                                title="Eliminar categoría"
                                style={{ color: '#FF4655' }}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    {profile.categories.length === 0 && (
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No hay categorías. El radar estará vacío.</p>
                    )}
                </div>
            </div>

            {/* Skills Management */}
            <div className="glass-card p-5 mb-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Administrar Habilidades
                </h3>
                {profile.skills.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        No tienes habilidades creadas
                    </p>
                ) : (
                    <div className="space-y-2">
                        {profile.skills.map((skill) => (
                            <div
                                key={skill.id}
                                className="flex items-center justify-between p-3 rounded-lg"
                                style={{ background: 'rgba(255,255,255,0.03)' }}
                            >
                                <div>
                                    <span className="text-sm font-medium">{skill.name}</span>
                                    <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                                        ({skill.category})
                                    </span>
                                </div>
                                <button
                                    className="glass-btn text-xs !p-1.5"
                                    onClick={() => removeSkill(skill.id)}
                                    title="Eliminar habilidad"
                                    style={{ color: '#FF4655' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Schedule Management */}
            <div className="glass-card p-5 mb-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Horario base editable
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Cambia este JSON cada semestre. Se exporta junto con tu perfil.
                </p>
                <textarea
                    className="glass-input"
                    style={{ minHeight: 220, fontFamily: "'Space Mono', monospace", fontSize: '0.72rem' }}
                    value={scheduleDraft}
                    onChange={(event) => setScheduleDraft(event.target.value)}
                />
                <button className="glass-btn glass-btn-primary text-xs mt-3" onClick={handleApplySchedule}>
                    Aplicar horario
                </button>
                {scheduleStatus && (
                    <p className="text-xs mt-3" style={{ color: scheduleStatus.includes('actualizado') ? 'var(--color-aero-green)' : '#FF4655' }}>
                        {scheduleStatus}
                    </p>
                )}
            </div>

            {/* Data Management */}
            <div className="glass-card p-5 mb-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Datos
                </h3>
                <div className="flex flex-wrap gap-3">
                    <button className="glass-btn text-xs" onClick={handleExport}>
                        <Download size={14} /> Exportar Perfil
                    </button>
                    <button className="glass-btn text-xs" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} /> Importar Perfil
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        hidden
                    />
                </div>
                {importStatus && (
                    <motion.p
                        className="text-xs mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: importStatus.includes('correctamente') ? 'var(--color-aero-green)' : '#FF4655' }}
                    >
                        {importStatus}
                    </motion.p>
                )}
            </div>

            {/* Personal Calibration */}
            <div className="glass-card p-5 mb-5" style={{ borderColor: 'rgba(79, 195, 247, 0.28)' }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                    <Sparkles size={14} /> Calibración personal
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    Aplica tus stats reales desde el contexto personal: beca Itaipu, promedio 4.3, flexiones, JLPT N4, Digital Lab y Ore Pizzeria.
                </p>
                <button className="glass-btn glass-btn-primary text-xs" onClick={handleApplyPersonalCalibration}>
                    <Sparkles size={14} /> Aplicar calibración personal
                </button>
                {calibrationStatus && (
                    <motion.p
                        className="text-xs mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: 'var(--color-aero-green)' }}
                    >
                        {calibrationStatus}
                    </motion.p>
                )}
            </div>

            {/* Stats summary */}
            <div className="glass-card p-5 mb-5">
                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    Resumen
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Habilidades', value: profile.skills.length },
                        { label: 'Misiones creadas', value: profile.missions.length },
                        { label: 'XP Total', value: profile.overallXP.toLocaleString() },
                        { label: 'Racha máxima', value: `${profile.longestStreak} días` },
                        { label: 'Bloques horario', value: profile.scheduleTemplates.length },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-lg font-bold font-heading" style={{ color: 'var(--color-aero-blue)' }}>
                                {stat.value}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-5" style={{ borderColor: 'rgba(255, 70, 85, 0.3)' }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#FF4655' }}>
                    <AlertTriangle size={14} /> Zona de Peligro
                </h3>
                {!showReset ? (
                    <button
                        className="glass-btn text-xs"
                        style={{ borderColor: 'rgba(255, 70, 85, 0.4)', color: '#FF4655' }}
                        onClick={() => setShowReset(true)}
                    >
                        <RotateCcw size={14} /> Reiniciar todo el progreso
                    </button>
                ) : (
                    <div>
                        <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                            Esto eliminará TODAS tus habilidades, misiones y XP. ¿Estás seguro?
                        </p>
                        <div className="flex gap-2">
                            <button
                                className="glass-btn text-xs"
                                style={{ background: 'rgba(255, 70, 85, 0.2)', borderColor: 'rgba(255, 70, 85, 0.5)', color: '#FF4655' }}
                                onClick={handleReset}
                            >
                                Sí, reiniciar
                            </button>
                            <button className="glass-btn text-xs" onClick={() => setShowReset(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
