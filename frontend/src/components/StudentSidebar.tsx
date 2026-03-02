'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { href: '/my-courses', icon: 'book', label: 'My Courses' },
    { href: '/certificates', icon: 'workspace_premium', label: 'Certificates' },
    { href: '/settings', icon: 'settings', label: 'Account Settings' },
];

interface StudentSidebarProps {
    isSidebarCollapsed?: boolean;
    setIsSidebarCollapsed?: (collapsed: boolean) => void;
}

export default function StudentSidebar({
    isSidebarCollapsed = false,
    setIsSidebarCollapsed
}: StudentSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 gap-8 min-h-screen sticky top-0 transition-all duration-300 z-40`}>
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-2 mb-4`}>
                <Link href="/" className="flex items-center gap-3 overflow-hidden group">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-lg">medical_services</span>
                    </div>
                    {!isSidebarCollapsed && (
                        <span className="font-bold text-sm tracking-tight truncate dark:text-white animate-in fade-in slide-in-from-left-2 duration-300">
                            Excelcommunity
                        </span>
                    )}
                </Link>
                <button
                    onClick={() => setIsSidebarCollapsed?.(!isSidebarCollapsed)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">
                        {isSidebarCollapsed ? 'chevron_right' : 'menu_open'}
                    </span>
                </button>
            </div>

            <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'
                                }`}
                            title={isSidebarCollapsed ? item.label : ''}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            {!isSidebarCollapsed && <span className="font-medium animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
            {/* Premium CTA */}
            {!isSidebarCollapsed && (
                <div className="mt-auto bg-primary/10 rounded-2xl p-4 flex flex-col gap-3 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Premium Plan</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Unlock advanced clinical simulations and mock state tests.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Upgrade Now
                    </motion.button>
                </div>
            )}
            {isSidebarCollapsed && (
                <div className="mt-auto flex justify-center pb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center cursor-pointer" title="Upgrade Now">
                        <span className="material-symbols-outlined text-sm">bolt</span>
                    </div>
                </div>
            )}
        </aside>
    );
}
