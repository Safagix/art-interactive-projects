// =============================================================================
// EndOfDay — Triumph / Patience Closing Screens
// =============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, ArrowRight } from 'lucide-react';
import { getTriumphQuote, getPatienceQuote } from '@/services/PromptEngine';

interface EndOfDayProps {
    type: 'triumph' | 'patience';
    onDismiss: () => void;
}

export function EndOfDay({ type, onDismiss }: EndOfDayProps) {
    const [quote] = useState(() =>
        type === 'triumph' ? getTriumphQuote() : getPatienceQuote()
    );

    const isTriumph = type === 'triumph';

    return (
        <motion.div
            className={`endofday-overlay ${isTriumph ? 'triumph' : 'patience'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
        >
            <motion.div
                className="endofday-content"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0.5, 1.2, 1] }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    {isTriumph
                        ? <Sun size={64} className="endofday-icon triumph" />
                        : <Cloud size={64} className="endofday-icon patience" />
                    }
                </motion.div>

                {/* Title */}
                <h1 className="endofday-title">
                    {isTriumph ? 'Paisaje del Triunfo' : 'Valle de la Paciencia'}
                </h1>

                {/* Quote */}
                <motion.p
                    className="endofday-quote"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    "{quote}"
                </motion.p>

                {/* Dismiss */}
                <motion.button
                    className="glass-btn glass-btn-primary endofday-btn"
                    onClick={onDismiss}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    whileHover={{ scale: 1.03 }}
                >
                    {isTriumph ? 'Descansar como campeón' : 'Mañana es un nuevo ciclo'}
                    <ArrowRight size={16} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
