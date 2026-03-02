'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface StudentHeaderProps {
    title: string;
    subtitle?: string;
}

export default function StudentHeader({ title, subtitle }: StudentHeaderProps) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // Load notifications lazily from cache first, then refresh in background
    useEffect(() => {
        if (!user) return;
        // Load from cache instantly (no delay)
        const cached = sessionStorage.getItem('student_notifications');
        if (cached) {
            try { setNotifications(JSON.parse(cached)); } catch { }
        }
        // Refresh from server in background (non-blocking)
        const timer = setTimeout(() => {
            api.get('/admin/notifications').then(res => {
                const data = res.data || [];
                setNotifications(data);
                sessionStorage.setItem('student_notifications', JSON.stringify(data));
            }).catch(() => { });
        }, 500); // Small delay so page content loads first
        return () => clearTimeout(timer);
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markRead = async (id: string) => {
        try {
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch { }
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur z-20 shrink-0">
            <div className="flex flex-col">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            {/* Backdrop */}
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>

                            {/* Dropdown */}
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-black uppercase text-primary px-2 py-0.5 bg-primary/10 rounded">
                                            {unreadCount} New
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n: any) => (
                                            <div
                                                key={n.id}
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
                                                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center">
                                            <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">notifications_off</span>
                                            <p className="text-xs text-slate-500 mt-2">No notifications yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
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
                    className="p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <span className="material-symbols-outlined">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    {<span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user?.name?.split(' ')[0]}</span>}
                </div>
            </div>
        </header>
    );
}
