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
    const { user, activeRole, setActiveRole, logout } = useAuth();

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

            {/* Sidebar - Dynamically styles for both Light and Dark mockups */}
            <aside className={`
                ${isSidebarCollapsed ? 'lg:w-[84px]' : 'lg:w-[280px]'} 
                fixed inset-y-0 left-0 z-40 w-[280px] bg-[#F8F9FC] dark:bg-[#0A0F1C] border-r border-[#E2E8F0] dark:border-slate-800/80
                transition-all duration-300 ease-in-out flex flex-col font-sans
                lg:static lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className={`h-24 flex items-center shrink-0 border-b border-[#E2E8F0] dark:border-slate-800/80 relative ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                    {!isSidebarCollapsed && (
                        <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
                            <div className="w-10 h-10 rounded-full border-[1.5px] border-slate-900 dark:border-white flex items-center justify-center shrink-0">
                                <span className="text-slate-900 dark:text-white text-xl font-medium leading-none mb-0.5">E</span>
                            </div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300 min-w-0 pr-2 pt-1">
                                <h1 className="font-bold text-[18px] tracking-tight leading-none text-slate-900 dark:text-white truncate">Excelcommunity</h1>
                                <p className="text-[13px] text-blue-500 font-medium mt-1 truncate">Admin Console</p>
                            </div>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`hidden lg:flex items-center justify-center transition-colors z-50 ${
                            isSidebarCollapsed
                                ? 'w-10 h-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                : 'w-8 h-8 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {isSidebarCollapsed ? 'menu' : 'menu'}
                        </span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col py-6">
                    {/* Main Navigation Section */}
                    {!isSidebarCollapsed && (
                        <div className="px-6 mb-4">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest">MAIN NAVIGATION</span>
                        </div>
                    )}
                    
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = tab === item.id;
                            const isLink = item.href && window.location.pathname !== item.href;

                            const content = (
                                <>
                                    <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300'}`}>
                                        {item.icon}
                                    </span>
                                    {!isSidebarCollapsed && (
                                        <span className={`font-medium text-[15px] animate-in fade-in slide-in-from-left-2 duration-300 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>{item.label}</span>
                                    )}
                                </>
                            );

                            const className = `
                                w-full group flex items-center gap-4 py-3 transition-all duration-200
                                ${isActive
                                    ? 'border-l-4 border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-transparent'
                                    : 'border-l-4 border-transparent'
                                }
                                ${isSidebarCollapsed ? 'justify-center px-0 border-none' : 'px-6 -ml-1'}
                            `;

                            if (isLink && !setTab) {
                                return (
                                    <Link key={item.id} href={item.href} className={className} title={isSidebarCollapsed ? item.label : ''}>
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

                    <div className="mx-6 my-6 border-b border-[#E2E8F0] dark:border-slate-800/80"></div>

                    {/* Switch Section */}
                    {!isSidebarCollapsed && (
                        <div className="px-6 mb-4">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">SWITCH</span>
                        </div>
                    )}
                    <button
                        onClick={() => setActiveRole('STUDENT')}
                        className={`w-full group flex items-center gap-4 py-3 transition-colors duration-200 border-l-4 border-transparent ${isSidebarCollapsed ? 'justify-center px-0 border-none' : 'px-6 -ml-1'}`}
                        title="Switch to Student view"
                    >
                        <span className="material-symbols-outlined text-[22px] text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300">school</span>
                        {!isSidebarCollapsed && (
                            <span className="font-medium text-[15px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white animate-in fade-in slide-in-from-left-2 duration-300">Switch to Student</span>
                        )}
                    </button>

                    <div className="mx-6 my-6 border-b border-[#E2E8F0] dark:border-slate-800/80"></div>

                    {/* User Area */}
                    <div className="mt-auto flex flex-col space-y-2 pb-4">
                        <Link
                            href="/settings"
                            onClick={() => { if (window.innerWidth < 1024) setIsMobileMenuOpen(false); }}
                            className={`w-full group flex items-center gap-4 py-2 transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}
                        >
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                <span className="text-xl font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{user?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300 text-left">
                                    <p className="text-[15px] font-medium text-slate-900 dark:text-slate-200 truncate group-hover:text-black dark:group-hover:text-white transition-colors">{user?.name || 'Administrator'}</p>
                                    <p className="text-[13px] text-slate-500 truncate">{user?.email || 'admin@excelcommunity.com'}</p>
                                </div>
                            )}
                        </Link>

                        <button
                            onClick={logout}
                            className={`w-full group flex items-center gap-4 py-3 transition-colors duration-200 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-6'}`}
                            title="Log Out"
                        >
                            <span className="material-symbols-outlined text-[22px] text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">power_settings_new</span>
                            {!isSidebarCollapsed && (
                                <span className="font-medium text-[15px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white animate-in fade-in slide-in-from-left-2 duration-300 transition-colors">Log Out</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
