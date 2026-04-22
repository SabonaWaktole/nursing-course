'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

export default function UserDropdown() {
    const { user, activeRole, setActiveRole, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
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

    // Theme initialization
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    if (!user) return null;

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white font-bold flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.3)] border border-primary/20 shrink-0 transition-shadow hover:shadow-[0_0_20px_rgba(13,185,242,0.5)]"
                title="Account Menu"
            >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute right-0 mt-3 w-[300px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_10px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden origin-top-right"
                    >
                        <div className="flex flex-col w-full">
                            {/* Top Profile Section */}
                            <div className="pt-8 pb-6 px-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50">
                                <div className="relative w-16 h-16 rounded-[14px] bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg mb-4">
                                    {/* Placeholder for real image, using letter currently */}
                                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                                </div>
                                <h3 className="text-[17px] font-black text-slate-900 dark:text-white leading-tight mb-1">{user.name}</h3>
                                <p className="text-[12px] text-slate-500 font-medium mb-4">{user.email}</p>
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                        {user.role === 'ADMIN' ? 'MANAGING DIRECTOR' : 'STUDENT'}
                                    </span>
                                </div>
                            </div>

                            {/* Menu Links */}
                            <div className="p-3 flex flex-col gap-0.5">
                                <div className="px-3 py-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                                    Account Settings
                                </div>
                                
                                <Link
                                    href="/settings"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
                                    Settings
                                </Link>
                                
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors w-full text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[20px] text-slate-400">{isDark ? 'light_mode' : 'wb_sunny'}</span>
                                        Theme: {isDark ? 'Dark' : 'Light'}
                                    </div>
                                    <span className="material-symbols-outlined text-[16px] text-slate-300">chevron_right</span>
                                </button>
                                                    
                                {user.role === 'ADMIN' && (
                                    <button
                                        onClick={() => {
                                            setActiveRole(activeRole === 'ADMIN' ? 'STUDENT' : 'ADMIN');
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors w-full text-left"
                                    >
                                        <span className="material-symbols-outlined text-[20px] text-slate-400">school</span>
                                        Switch to {activeRole === 'ADMIN' ? 'Student View' : 'Admin View'}
                                    </button>
                                )}

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-1"></div>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        logout();
                                    }}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors w-full text-left"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    Log Out
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center rounded-b-3xl">
                                <span className="text-[10px] text-slate-400 font-semibold">v1.0.0 Stable</span>
                                <span className="text-[10px] text-slate-400 font-semibold">Excelcommunity © {new Date().getFullYear()}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
