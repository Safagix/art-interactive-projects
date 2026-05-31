// =============================================================================
// CelebrationHoldBtn — Physical Dopamine Anchoring Button
// =============================================================================
// Requires 3-second press-and-hold to confirm epic achievements.
// Visual circular progress fills as you hold. Releases early = reset.
// =============================================================================

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CelebrationHoldBtnProps {
    onComplete: () => void;
    label?: string;
    duration?: number; // ms, default 3000
}

export function CelebrationHoldBtn({
    onComplete,
    label = 'Celebra el Esfuerzo',
    duration = 3000,
}: CelebrationHoldBtnProps) {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    const startHold = useCallback(() => {
        if (isCompleted) return;
        setIsHolding(true);
        startTimeRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const pct = Math.min((elapsed / duration) * 100, 100);
            setProgress(pct);

            if (pct >= 100) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsCompleted(true);
                setIsHolding(false);
                onComplete();
            }
        }, 16); // ~60fps
    }, [duration, isCompleted, onComplete]);

    const endHold = useCallback(() => {
        if (isCompleted) return;
        setIsHolding(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(0);
    }, [isCompleted]);

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress / 100);

    return (
        <motion.div
            className="celebration-hold-wrapper"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            <button
                className={`celebration-hold-btn ${isHolding ? 'holding' : ''} ${isCompleted ? 'completed' : ''}`}
                onMouseDown={startHold}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={startHold}
                onTouchEnd={endHold}
                disabled={isCompleted}
            >
                {/* Circular progress ring */}
                <svg viewBox="0 0 120 120" className="celebration-ring">
                    <circle cx="60" cy="60" r={radius} className="celebration-ring-track" />
                    <circle
                        cx="60" cy="60" r={radius}
                        className="celebration-ring-fill"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            filter: isHolding ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))' : 'none',
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="celebration-hold-inner">
                    {isCompleted ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0.5, 1.3, 1] }}
                            transition={{ duration: 0.5 }}
                        >
                            <Sparkles size={28} className="text-yellow-400" />
                        </motion.div>
                    ) : (
                        <Sparkles size={24} />
                    )}
                </div>
            </button>

            <p className="celebration-hold-label">
                {isCompleted ? '¡Victoria anclada!' : isHolding ? 'Mantén presionado...' : label}
            </p>
        </motion.div>
    );
}
