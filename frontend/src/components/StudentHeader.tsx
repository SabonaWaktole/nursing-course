'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import UserDropdown from './UserDropdown';

interface StudentHeaderProps {
    title?: string;
    subtitle?: string;
    icon?: string;
    onMobileMenuOpen?: () => void;
}

export default function StudentHeader({ title, subtitle, icon, onMobileMenuOpen }: StudentHeaderProps) {
    const { user, logout, activeRole, setActiveRole } = useAuth();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'courses';

    const NAV_LINKS = [
        { href: '/my-learning?tab=courses', id: 'courses', label: 'My Courses', icon: 'school' },
        { href: '/my-learning?tab=certificates', id: 'certificates', label: 'Certifications', icon: 'workspace_premium' },
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
                        const isActive = item.id === 'all-courses' 
                            ? pathname === '/courses' 
                            : pathname === '/my-learning' && currentTab === item.id;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold tracking-tight transition-colors duration-300 relative",
                                    isActive ? "text-primary" : "text-slate-600 dark:text-slate-300 hover:text-primary"
                                )}
                            >
                                <span className={cn(
                                    "material-symbols-outlined text-[20px] transition-all duration-300",
                                    isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:text-primary"
                                )}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="student-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 relative">
                <UserDropdown />
            </div>
        </header>
    );
}
