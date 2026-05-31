// =============================================================================
// Sidebar V4 — Updated with Forge, Chronicle, and End Day
// =============================================================================

import { motion } from 'framer-motion';
import {
    LayoutDashboard, User, BookOpen, Target,
    Hammer, ScrollText, Settings, Moon, Globe, CalendarClock, CircleHelp
} from 'lucide-react';

export type PageId = 'dashboard' | 'schedule' | 'rank' | 'skills' | 'bounty' | 'forge' | 'chronicle' | 'orbits' | 'guide' | 'settings';

interface SidebarProps {
    activePage: PageId;
    onNavigate: (page: PageId) => void;
    onEndDay?: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Horario', icon: CalendarClock },
    { id: 'forge', label: 'La Forja', icon: Hammer },
    { id: 'chronicle', label: 'La Crónica', icon: ScrollText },
    { id: 'orbits', label: 'Órbitas', icon: Globe },
    { id: 'rank', label: 'Rangos', icon: User },
    { id: 'skills', label: 'Skills', icon: BookOpen },
    { id: 'bounty', label: 'Misiones', icon: Target },
    { id: 'guide', label: 'Guía', icon: CircleHelp },
    { id: 'settings', label: 'Config', icon: Settings },
];

export function Sidebar({ activePage, onNavigate, onEndDay }: SidebarProps) {
    return (
        <nav className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <span className="sidebar-logo-text">PS</span>
            </div>

            {/* Navigation */}
            <div className="sidebar-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            {isActive && (
                                <motion.div
                                    className="sidebar-indicator"
                                    layoutId="sidebar-indicator"
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <Icon size={18} />
                            <span className="sidebar-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* End Day Button */}
            {onEndDay && (
                <button
                    className="sidebar-item sidebar-endday"
                    onClick={onEndDay}
                    style={{ marginTop: 'auto' }}
                >
                    <Moon size={18} />
                    <span className="sidebar-label">Cerrar el Día</span>
                </button>
            )}
        </nav>
    );
}
