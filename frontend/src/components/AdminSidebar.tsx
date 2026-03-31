'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

interface AdminSidebarProps {
    tab: 'overview' | 'courses' | 'users' | 'results' | 'certificates' | 'settings';
    setTab?: (tab: any) => void;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    loadUsers?: () => void;
    loadResults?: () => void;
    loadCertificates?: () => void;
}

export default function AdminSidebar({
    tab,
    setTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    loadUsers,
    loadResults,
    loadCertificates
}: AdminSidebarProps) {
    const { user } = useAuth();

    const navItems = [
        { id: 'overview', icon: 'grid_view', label: 'Overview', onClick: () => setTab?.('overview'), href: '/admin' },
        { id: 'courses', icon: 'menu_book', label: 'Courses', onClick: () => setTab?.('courses'), href: '/admin' },
        { id: 'users', icon: 'people_alt', label: 'Users', onClick: () => { setTab?.('users'); loadUsers?.(); }, href: '/admin' },
        { id: 'results', icon: 'analytics', label: 'Results', onClick: () => { setTab?.('results'); loadResults?.(); }, href: '/admin' },
        { id: 'certificates', icon: 'card_membership', label: 'Certificates', onClick: () => { setTab?.('certificates'); loadCertificates?.(); }, href: '/admin' },
    ];

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
                fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
                transition-all duration-300 ease-in-out
                lg:static lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-slate-200 dark:border-transparent">
                    <Link href="/" className="flex items-center gap-3 overflow-hidden group">
                        <motion.div
                            whileHover={{ rotate: 8, scale: 1.08 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.1)] dark:shadow-[0_0_12px_rgba(13,185,242,0.2)] shrink-0"
                        >
                            <span className="text-primary text-lg font-black">E</span>
                        </motion.div>
                        {!isSidebarCollapsed && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <h1 className="font-bold text-lg tracking-tight leading-none text-slate-900 dark:text-white">Excelcommunity Living Inc</h1>
                                <p className="text-xs text-slate-500 font-medium">Admin Console</p>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isSidebarCollapsed ? 'chevron_right' : 'menu_open'}
                        </span>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isLink = item.href && window.location.pathname !== item.href;

                        const content = (
                            <>
                                <span className={`material-symbols-outlined text-xl transition-colors ${tab === item.id ? 'text-primary' : 'group-hover:text-primary'}`}>
                                    {item.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className="font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                                )}
                            </>
                        );

                        const className = `
                            w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                            ${tab === item.id
                                ? 'bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_rgba(13,185,242,0.1)]'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                            }
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `;

                        if (isLink && !setTab) {
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={className}
                                    title={isSidebarCollapsed ? item.label : ''}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    item.onClick();
                                    if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                                }}
                                className={className}
                                title={isSidebarCollapsed ? item.label : ''}
                            >
                                {content}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                        onClick={() => {
                            setTab?.('settings');
                            if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${tab === 'settings' ? 'bg-primary/10 border border-primary/20 text-primary' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300 text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@excelcommunity.com'}</p>
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
