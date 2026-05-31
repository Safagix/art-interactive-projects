// =============================================================================
// BurnoutShield — Full-screen UX Block Component
// =============================================================================
// Renders when ENFJ boolean matrix detects destructive patterns.
// Forces a 10-minute NSDR timer before allowing app access.
// =============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Moon, Heart, Play, Check } from 'lucide-react';

interface BurnoutShieldProps {
    suggestion: string;
    reason: string;
    onComplete: () => void;
}

export function BurnoutShield({ suggestion, reason, onComplete }: BurnoutShieldProps) {
    const NSDR_DURATION = 600; // 10 minutes in seconds
    const [timeLeft, setTimeLeft] = useState(NSDR_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    setIsComplete(true);
                    setIsRunning(false);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((NSDR_DURATION - timeLeft) / NSDR_DURATION) * 100;

    return (
        <motion.div
            className="burnout-shield-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="burnout-shield-content"
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.3 }}
            >
                {/* Shield Icon */}
                <motion.div
                    className="burnout-shield-icon"
                    initial={{ rotate: -10 }}
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                    <ShieldAlert size={64} />
                </motion.div>

                {/* Title */}
                <h1 className="burnout-shield-title">Escudo de Energía Activado</h1>
                <p className="burnout-shield-reason">{reason}</p>

                {/* Suggestion */}
                <motion.div
                    className="burnout-shield-quote"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Moon size={20} />
                    <p>"{suggestion}"</p>
                </motion.div>

                {/* NSDR Timer */}
                <div className="burnout-timer-section">
                    <h3>NSDR (Yoga Nidra) — Recuperación Guiada</h3>

                    {/* Circular Progress */}
                    <div className="burnout-timer-circle">
                        <svg viewBox="0 0 120 120" className="burnout-timer-svg">
                            <circle cx="60" cy="60" r="52" className="burnout-timer-track" />
                            <circle
                                cx="60" cy="60" r="52"
                                className="burnout-timer-fill"
                                strokeDasharray={`${2 * Math.PI * 52}`}
                                strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                            />
                        </svg>
                        <div className="burnout-timer-text">
                            {isComplete ? (
                                <Check size={32} className="text-green-400" />
                            ) : (
                                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                            )}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    {!isComplete ? (
                        <button
                            className="glass-btn glass-btn-primary burnout-start-btn"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            <Play size={16} />
                            {isRunning ? 'Pausar' : 'Iniciar NSDR'}
                        </button>
                    ) : (
                        <motion.button
                            className="glass-btn glass-btn-primary burnout-continue-btn"
                            onClick={onComplete}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <Heart size={16} />
                            Continuar con cuidado
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
