'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentHeaderProps {
    title?: string;
    subtitle?: string;
    icon?: string;
    onMobileMenuOpen?: () => void;
}

export default function StudentHeader({ title, subtitle, icon, onMobileMenuOpen }: StudentHeaderProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    useEffect(() => {
        if (!user) return;
        const cached = sessionStorage.getItem('student_notifications');
        if (cached) {
            try { setNotifications(JSON.parse(cached)); } catch { }
        }
        const timer = setTimeout(() => {
            api.get('/admin/notifications').then(res => {
                const data = res.data || [];
                setNotifications(data);
                sessionStorage.setItem('student_notifications', JSON.stringify(data));
            }).catch(() => { });
        }, 500);
        return () => clearTimeout(timer);
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (id: string) => {
        try {
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { }
    };

    const clearAll = async () => {
        try {
            await api.delete('/admin/notifications');
            setNotifications([]);
            setShowNotifications(false);
        } catch { }
    };

    const NAV_LINKS = [
        { href: '/my-courses', label: 'My Courses', icon: 'school' },
        { href: '/courses', label: 'Courses', icon: 'explore' },
        { href: '/certificates', label: 'Certifications', icon: 'workspace_premium' },
    ];

    return (
        <header className="h-[72px] flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] z-20 shrink-0 transition-all duration-500">
            <div className="flex-1 flex items-center gap-4">
                {/* Mobile menu toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMobileMenuOpen}
                    className="lg:hidden p-2.5 -ml-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full transition-all"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </motion.button>

                {/* Logo — visible only on mobile/tablet when sidebar is hidden */}
                <Link href="/" className="lg:hidden flex items-center gap-3 group shrink-0">
                    <motion.div
                        whileHover={{ rotate: 8, scale: 1.08 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="relative w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-[#1e293b] border border-primary/30 shadow-[0_0_12px_rgba(13,185,242,0.1)] dark:shadow-[0_0_12px_rgba(13,185,242,0.2)]"
                    >
                        <span className="text-primary text-base font-black">E</span>
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                            Excelcommunity
                        </span>
                        <span className="text-[9px] italic text-slate-500 group-hover:text-primary/80 transition-colors duration-300">
                            Knowledge produces quality care
                        </span>
                    </div>
                </Link>

                {/* Navigation Links — Spaced edge-to-edge to fill all gaps as requested */}
                <nav className="hidden md:flex flex-1 items-center justify-between ml-8 mr-10 px-4">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold tracking-tight transition-colors duration-300 relative ${
                                    isActive ? 'text-primary bg-primary/5 rounded-xl border border-primary/20' : 'text-slate-600 dark:text-slate-300 hover:text-primary'
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] transition-all duration-300 ${
                                    isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                                }`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                        href="/settings"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white font-bold flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.3)] border border-primary/20 shrink-0 transition-shadow hover:shadow-[0_0_20px_rgba(13,185,242,0.5)]"
                        title="Account Settings"
                    >
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Link>
                </motion.div>
            </div>
        </header>
    );
}
