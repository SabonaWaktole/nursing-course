'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { href: '/my-courses', icon: 'dashboard', label: 'Dashboard' },
    { href: '/my-courses', icon: 'book', label: 'My Courses' },
    { href: '/courses', icon: 'assignment_turned_in', label: 'Practice Exams' },
    { href: '/certificates', icon: 'workspace_premium', label: 'Certificates' },
    { href: '/settings', icon: 'settings', label: 'Account Settings' },
];

export default function StudentSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 gap-8 min-h-screen sticky top-16 transition-colors duration-300">
            <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary'
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            {/* Premium CTA */}
            <div className="mt-auto bg-primary/10 rounded-2xl p-4 flex flex-col gap-3 border border-primary/20">
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
        </aside>
    );
}
