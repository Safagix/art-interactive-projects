// =============================================================================
// SpotlightMode — Immersive Focus Overlay
// =============================================================================
// Darkens 90% of the screen, leaving only the active habit + timer centered.
// Pure CSS/React portal — zero external dependencies.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Play, Pause, RotateCcw } from 'lucide-react';

interface SpotlightModeProps {
    habitName: string;
    habitIcon: string;
    isOpen: boolean;
    onClose: () => void;
}

export function SpotlightMode({ habitName, habitIcon, isOpen, onClose }: SpotlightModeProps) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, [isRunning]);

    const reset = useCallback(() => {
        setSeconds(0);
        setIsRunning(false);
    }, []);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="spotlight-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className="spotlight-content"
                        initial={{ scale: 0.85, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    >
                        {/* Close */}
                        <button className="spotlight-close" onClick={onClose}>
                            <X size={20} />
                        </button>

                        {/* Habit Icon & Name */}
                        <div className="spotlight-habit-icon">{habitIcon}</div>
                        <h2 className="spotlight-habit-name">{habitName}</h2>

                        {/* Timer */}
                        <div className="spotlight-timer">
                            <Timer size={18} className="text-aero-blue" />
                            <span className="spotlight-timer-value">{formatTime(seconds)}</span>
                        </div>

                        {/* Controls */}
                        <div className="spotlight-controls">
                            <button
                                className="glass-btn"
                                onClick={() => setIsRunning(!isRunning)}
                            >
                                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                                {isRunning ? 'Pausar' : 'Iniciar'}
                            </button>
                            <button className="glass-btn" onClick={reset}>
                                <RotateCcw size={16} /> Reset
                            </button>
                        </div>

                        <p className="spotlight-hint">
                            Enfócate solo en esta tarea. Todo lo demás desaparece.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
