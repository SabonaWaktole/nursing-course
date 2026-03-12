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

    const NAV_LINKS = [
        { href: '/my-courses', label: 'My Courses', icon: 'school' },
        { href: '/courses', label: 'Courses', icon: 'explore' },
        { href: '/certificates', label: 'Certifications', icon: 'workspace_premium' },
    ];

    return (
        <header className="h-[72px] flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl shadow-[0_8px_32px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] z-20 shrink-0 transition-all duration-500">
            <div className="flex items-center gap-4">
                {/* Mobile menu toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onMobileMenuOpen}
                    className="lg:hidden p-2.5 -ml-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </motion.button>

                {/* Logo — matches global Navbar */}
                <Link href="/" className="flex items-center gap-2 group">
                    <motion.span
                        whileHover={{ rotate: 8, scale: 1.05 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="material-symbols-outlined text-primary text-2xl drop-shadow-[0_0_26px_rgba(13,185,242,0.65)]"
                    >
                        medical_services
                    </motion.span>
                    <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors hidden sm:inline">
                        Excelcommunity
                    </span>
                </Link>

                {/* Floating pill navigation — matches global Navbar exactly */}
                <nav className="hidden md:flex items-center gap-1 rounded-full bg-slate-900/[0.03] dark:bg-slate-900/70 px-2 py-1.5 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-2xl shadow-[0_10px_35px_rgba(15,23,42,0.22)] ml-4">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative text-[13px] font-semibold transition-colors group px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
                                    isActive
                                        ? 'text-primary'
                                        : 'text-slate-600 dark:text-slate-200 hover:text-primary dark:hover:text-primary'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                {item.label}
                                {isActive ? (
                                    <motion.span
                                        layoutId="studentNavActive"
                                        className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary/90 rounded-full"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                ) : (
                                    <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary/90 transition-all duration-300 group-hover:opacity-100 opacity-0 rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Search — matches global Navbar */}
                <div className="relative hidden lg:block group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-44 xl:w-56 pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all duration-300 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]"
                    />
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>

                {/* Notification Bell */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl leading-none">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-950"></span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
                                    className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-black uppercase text-primary px-2.5 py-1 bg-primary/10 rounded-full">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? (
                                            notifications.map((n: any, ni: number) => (
                                                <motion.div
                                                    key={n.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: ni * 0.05, duration: 0.25 }}
                                                    onClick={() => { markRead(n.id); setShowNotifications(false); }}
                                                    className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'CERT_APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                            n.type === 'CERT_REJECTED' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                                                                'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-lg">
                                                                {n.type === 'CERT_APPROVED' ? 'verified' :
                                                                    n.type === 'CERT_REJECTED' ? 'cancel' : 'info'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                                                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                                {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse shrink-0"></div>}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="p-10 text-center">
                                                <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">notifications_off</span>
                                                <p className="text-xs text-slate-500 mt-2">No notifications yet</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Theme Toggle — matches global Navbar ThemeToggle style */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        const next = !document.documentElement.classList.contains('dark');
                        setIsDark(next);
                        if (next) {
                            document.documentElement.classList.add('dark');
                            localStorage.setItem('theme', 'dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                            localStorage.setItem('theme', 'light');
                        }
                    }}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl leading-none">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                </motion.button>

                {/* Settings button — matches global Navbar */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/settings" className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-xl leading-none">settings</span>
                    </Link>
                </motion.div>

                {/* Logout button — matches global Navbar */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
                    title="Logout"
                >
                    <span className="material-symbols-outlined text-xl leading-none">logout</span>
                </motion.button>
            </div>
        </header>
    );
}
