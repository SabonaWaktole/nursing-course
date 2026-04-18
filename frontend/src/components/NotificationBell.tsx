'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

export default function NotificationBell() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Notifications initialization
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

    const markRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
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
            setIsOpen(false);
        } catch { }
    };

    if (!user) return null;

    return (
        <div className="relative z-50 flex items-center" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Notifications"
            >
                <span className="material-symbols-outlined text-2xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 pointer-events-none"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_10px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden origin-top-right"
                    >
                        <div className="flex flex-col">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                                <h4 className="font-bold text-slate-900 dark:text-white flex-1">Notifications</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3">
                                {notifications.length > 0 ? (
                                    <div className="space-y-2">
                                        {notifications.map((n) => (
                                            <div 
                                                key={n.id} 
                                                className={`p-4 rounded-2xl transition-all border ${n.read ? 'bg-transparent border-transparent opacity-60 hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'bg-white dark:bg-slate-800/60 shadow-[0_4px_20px_rgba(13,185,242,0.06)] border-primary/20 dark:border-primary/30'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-gradient-to-br from-primary/20 to-cyan-500/20 text-primary border border-primary/20 shadow-inner'}`}>
                                                        <span className="material-symbols-outlined text-[18px]">{n.type === 'enrollment' ? 'local_library' : 'notifications_active'}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-[13px] text-slate-900 dark:text-slate-100 font-semibold leading-relaxed tracking-tight">{n.message}</p>
                                                        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                                                            <span className="material-symbols-outlined text-[12px] opacity-70">schedule</span>
                                                            {new Date(n.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {!n.read && (
                                                        <button onClick={(e) => markRead(n.id, e)} className="text-slate-300 hover:text-primary transition-all duration-300 hover:bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-[18px]">check</span>
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
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-center">
                                <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">Clear All</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
