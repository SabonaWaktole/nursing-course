'use client';

import { useEffect, useState, useRef } from 'react';
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
    const { user, logout, activeRole, setActiveRole } = useAuth();
    const pathname = usePathname();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <header className="h-[72px] flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] z-50 relative shrink-0 transition-all duration-500">
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
                <nav className="hidden md:flex flex-1 items-center justify-center gap-2">
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

            <div className="flex items-center gap-2 sm:gap-3 relative">
                {/* Notifications Link/Dropdown */}
                <div className="relative" ref={notifRef}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            showNotifications ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/50'
                        }`}
                        title="Notifications"
                    >
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-[7px] font-bold text-white">{unreadCount}</span>
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 overflow-hidden"
                            >
                                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Notifications</h4>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">Mark all read</button>
                                    )}
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                    {notifications.length > 0 ? (
                                        <div className="space-y-1">
                                            {notifications.map((n) => (
                                                <div 
                                                    key={n.id} 
                                                    className={`p-4 rounded-xl transition-all border ${n.read ? 'bg-transparent border-transparent opacity-60' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60'}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/20 text-primary'}`}>
                                                            <span className="material-symbols-outlined text-sm">{n.type === 'enrollment' ? 'person_add' : 'info'}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-tight">{n.message}</p>
                                                            <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                        </div>
                                                        {!n.read && (
                                                            <button onClick={() => markRead(n.id)} className="text-slate-400 hover:text-primary transition-colors">
                                                                <span className="material-symbols-outlined text-base">check_circle</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">notifications_off</span>
                                            <p className="text-sm text-slate-500">No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                                    <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">Clear All</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

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
