// =============================================================================
// NexusHub — The Gateway. Choose your path: Stats or Cognitive Gym.
// =============================================================================

import { motion } from 'framer-motion';
import { Swords, Brain, Zap, ArrowRight } from 'lucide-react';
import { SVGFollower } from '@/components/SVGFollower';
import { Typewriter } from '@/components/Typewriter';

export type NexusChoice = 'stats' | 'cognitive';

interface NexusHubProps {
    onSelect: (choice: NexusChoice) => void;
}

export function NexusHub({ onSelect }: NexusHubProps) {
    return (
        <div className="nexus-hub">
            {/* SVG cursor trail — sits between bg and content */}
            <SVGFollower />

            {/* Content overlay */}
            <div className="nexus-content">
                {/* Title */}
                <motion.div
                    className="nexus-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <Zap size={32} className="nexus-icon" />
                    <h1 className="nexus-title">
                        <Typewriter
                            text={["The Nexus", "Choose Your Path", "Enter The System"]}
                            speed={60}
                            waitTime={3500}
                            deleteSpeed={35}
                            className="nexus-typewriter"
                        />
                    </h1>
                    <p className="nexus-subtitle">What do you want to train today?</p>
                </motion.div>

                {/* Portal Cards */}
                <div className="nexus-portals">
                    {/* Stats Portal */}
                    <motion.button
                        className="nexus-portal nexus-portal--stats"
                        onClick={() => onSelect('stats')}
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 120 }}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <div className="nexus-portal-glow nexus-portal-glow--cyan" />
                        <div className="nexus-portal-content">
                            <Swords size={48} className="nexus-portal-icon" />
                            <h2 className="nexus-portal-title">Professional Stats</h2>
                            <p className="nexus-portal-desc">
                                Track habits, forge skills, complete bounties. Level up your real life.
                            </p>
                            <div className="nexus-portal-enter">
                                Enter <ArrowRight size={16} />
                            </div>
                        </div>
                    </motion.button>

                    {/* Cognitive Portal */}
                    <motion.button
                        className="nexus-portal nexus-portal--cognitive"
                        onClick={() => onSelect('cognitive')}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.6, type: 'spring', stiffness: 120 }}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <div className="nexus-portal-glow nexus-portal-glow--purple" />
                        <div className="nexus-portal-content">
                            <Brain size={48} className="nexus-portal-icon" />
                            <h2 className="nexus-portal-title">Cognitive Gym</h2>
                            <p className="nexus-portal-desc">
                                Deep focus sessions, neural drills, speed reading. Train your mind.
                            </p>
                            <div className="nexus-portal-enter">
                                Enter <ArrowRight size={16} />
                            </div>
                        </div>
                    </motion.button>
                </div>

                {/* Footer */}
                <motion.div
                    className="nexus-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <span className="nexus-footer-text">safagix • v4.0</span>
                </motion.div>
            </div>
        </div>
    );
}
