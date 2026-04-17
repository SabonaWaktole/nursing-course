'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
    { href: '/my-learning?tab=courses', id: 'courses', icon: 'school', label: 'My Courses' },
    { href: '/my-learning?tab=certificates', id: 'certificates', icon: 'workspace_premium', label: 'Certificates' },
    { href: '/settings', id: 'settings', icon: 'settings', label: 'Settings' },
];

interface StudentSidebarProps {
    isSidebarCollapsed?: boolean;
    setIsSidebarCollapsed?: (collapsed: boolean) => void;
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function StudentSidebar({
    isSidebarCollapsed = false,
    setIsSidebarCollapsed,
    isMobileMenuOpen = false,
    setIsMobileMenuOpen
}: StudentSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'courses';
    const { user, activeRole, setActiveRole } = useAuth();

    return (
        <>
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen?.(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                ${isSidebarCollapsed ? 'lg:w-[84px]' : 'lg:w-[280px]'}
                fixed inset-y-0 left-0 z-40 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                transition-all duration-300 ease-in-out flex flex-col
                lg:static lg:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                {/* Logo area — matches AdminSidebar */}
                <div className={`h-20 flex items-center shrink-0 border-b border-slate-200 dark:border-transparent relative ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
                    {!isSidebarCollapsed && (
                        <Link href="/" className="flex items-center gap-3 group shrink-0 min-w-0">
                            <motion.div
                                whileHover={{ rotate: 8, scale: 1.08 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.1)] dark:shadow-[0_0_12px_rgba(13,185,242,0.2)] shrink-0"
                            >
                                <span className="text-primary text-lg font-black">E</span>
                            </motion.div>
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300 flex flex-col justify-center min-w-0 pr-2">
                                <h1 className="font-bold text-[17px] tracking-tight leading-none text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-300 truncate">Excelcommunity</h1>
                                <p className="text-[10px] italic text-slate-500 font-medium mt-1 group-hover:text-primary transition-colors truncate">Knowledge produces quality care</p>
                                <p className="text-[11px] text-primary/80 font-medium mt-0.5 truncate">Student Portal</p>
                            </div>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed?.(!isSidebarCollapsed)}
                        className={`hidden lg:flex items-center justify-center transition-colors z-50 ${
                            isSidebarCollapsed
                                ? 'w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-primary text-slate-600 shadow-sm'
                                : 'w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 shrink-0'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isSidebarCollapsed ? 'menu' : 'menu_open'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === '/my-learning' && (item.id === 'courses' || item.id === 'certificates')
                            ? currentTab === item.id
                            : pathname === item.href || (item.id === 'settings' && pathname === '/settings');
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen?.(false)}
                                className={`
                                    w-full group flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_rgba(13,185,242,0.1)]'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                                    }
                                `}
                                title={isSidebarCollapsed ? item.label : ''}
                            >
                                <span className={`material-symbols-outlined text-xl transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                                    {item.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className="font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 space-y-2">
                    {/* Return to Admin — visible only to true Admins in Student mode */}
                    {user?.role === 'ADMIN' && (
                        <button
                            onClick={() => setActiveRole('ADMIN')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            title="Return to Admin view"
                        >
                            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                            {!isSidebarCollapsed && (
                                <span className="animate-in fade-in slide-in-from-left-2 duration-300">Return to Admin</span>
                            )}
                        </button>
                    )}
                    <Link
                        href="/settings"
                        onClick={() => setIsMobileMenuOpen?.(false)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300 text-left">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Student'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        )}
                    </Link>
                </div>
            </aside>
        </>
    );
}
