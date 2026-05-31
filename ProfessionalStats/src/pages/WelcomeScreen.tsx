// =============================================================================
// WelcomeScreen — Daily Ritual Entry Point
// =============================================================================
// First screen the user sees. Shows motivational quote, streak counter,
// global vision grid, and sleep input for burnout detection.
// =============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { getWelcomeQuote } from '@/services/PromptEngine';
import { NeuralBackground } from '@/components/NeuralBackground';
import { Typewriter } from '@/components/Typewriter';

interface WelcomeScreenProps {
    onStart: (sleepHours: number) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    const { profile } = useProfile();
    const [quote] = useState(getWelcomeQuote);
    const [sleepHours, setSleepHours] = useState(7);

    const categories = profile.categories.length > 0
        ? profile.categories
        : ['Mental', 'Físico', 'Carrera', 'Finanzas', 'Social', 'Creativo', 'Educación', 'Espiritual', 'Técnico', 'Hobbies'];

    const categoryIcons: Record<string, string> = {
        Mental: '🧠', Físico: '💪', Carrera: '💼', Finanzas: '💰',
        Social: '🤝', Creativo: '🎨', Educación: '📚', Espiritual: '🧘',
        Técnico: '💻', Hobbies: '🎮',
    };

    return (
        <motion.div
            className="welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <NeuralBackground />

            <motion.div
                className="welcome-content"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {/* Greeting */}
                <div className="welcome-greeting">
                    <Sun size={28} className="welcome-sun-icon" />
                    <h1 className="flex items-center gap-2">
                        <Typewriter 
                            text={["Buenos días", "Forge Your Legacy", "Master Your Craft", "Rise & Conquer"]}
                            speed={70}
                            waitTime={3000}
                            deleteSpeed={40}
                            className="text-white"
                        />
                    </h1>
                </div>

                {/* Quote */}
                <motion.p
                    className="welcome-quote"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    "{quote}"
                </motion.p>

                {/* Streak Counter */}
                <motion.div
                    className="welcome-streak glass-card liquid-glass"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                >
                    <Flame size={32} className="welcome-streak-flame" />
                    <div>
                        <span className="welcome-streak-count">{profile.currentStreak}</span>
                        <span className="welcome-streak-label">días de racha</span>
                    </div>
                    {profile.currentStreak >= 7 && (
                        <Sparkles size={20} className="text-yellow-400" />
                    )}
                </motion.div>

                {/* Global Vision Grid */}
                <div className="welcome-vision-grid">
                    <h3 className="section-title">Visión Global</h3>
                    <div className="welcome-categories">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat}
                                className="welcome-category-card glass-card liquid-glass"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 + i * 0.08 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <span className="welcome-category-icon">
                                    {categoryIcons[cat] || '📌'}
                                </span>
                                <span className="welcome-category-name">{cat}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sleep Input */}
                <motion.div
                    className="welcome-sleep glass-card liquid-glass"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <Moon size={20} />
                    <label>¿Horas dormidas hoy?</label>
                    <input
                        type="range"
                        min={2}
                        max={12}
                        step={0.5}
                        value={sleepHours}
                        onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                        className="welcome-sleep-slider"
                    />
                    <span className="welcome-sleep-value">{sleepHours}h</span>
                </motion.div>

                {/* Start Button */}
                <motion.button
                    className="welcome-start-btn glass-btn glass-btn-primary liquid-glass"
                    onClick={() => onStart(sleepHours)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    Comenzar el Día <ArrowRight size={18} />
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
