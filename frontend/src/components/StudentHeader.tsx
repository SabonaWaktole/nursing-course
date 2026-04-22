'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import UserDropdown from './UserDropdown';
import NotificationBell from './NotificationBell';

interface StudentHeaderProps {
    title?: string;
    subtitle?: string;
    icon?: string;
    onMobileMenuOpen?: () => void;
}

export default function StudentHeader({ title, subtitle, icon, onMobileMenuOpen }: StudentHeaderProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'courses';

    const NAV_LINKS = [
        { href: '/my-learning?tab=courses', id: 'courses', label: 'My Courses', icon: 'school' },
        { href: '/my-learning?tab=certificates', id: 'certificates', label: 'Certifications', icon: 'workspace_premium' },
    ];

    return (
        <header className="h-[76px] flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 relative shrink-0 transition-all duration-300">
            {/* Mobile Toggle */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onMobileMenuOpen}
                className="lg:hidden p-2.5 mr-4 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
                <span className="material-symbols-outlined text-2xl">menu</span>
            </motion.button>

            <div className="flex flex-1 items-center gap-12 h-full">
                {/* Page Title (Large) - Fixed width to prevent nav shifting */}
                <div className="hidden lg:flex items-center w-[220px] shrink-0">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white capitalize truncate">
                        {currentTab === 'courses' ? 'My Learning' : 'Certificates'}
                    </h1>
                </div>

                {/* Horizontal Tabs Navigation */}
                <nav className="hidden md:flex items-end h-full pt-4">
                    {NAV_LINKS.map((item) => {
                        const isActive = pathname === '/my-learning' && currentTab === item.id;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`group flex items-center gap-2 px-5 pb-5 pt-2 text-[15px] font-semibold transition-all duration-200 border-b-2 ${
                                    isActive
                                        ? 'text-blue-700 dark:text-blue-500 border-blue-700 dark:border-blue-500'
                                        : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px] mb-[1px]">
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Right Section: Notification & User Dropdown */}
            <div className="flex items-center gap-6 relative ml-6">
                <NotificationBell />
                <UserDropdown />
            </div>
        </header>
    );
}
