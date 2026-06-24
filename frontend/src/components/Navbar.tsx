'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import UserDropdown from './UserDropdown';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { user, logout, activeRole } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* ── Nav link data ─────────────────────────────────────── */
    const publicLinks = [
        { label: 'Courses', href: '/courses', icon: 'menu_book' },
        { label: 'Certifications', href: '/certifications', icon: 'workspace_premium' },
    ];

    const studentLinks = user && activeRole !== 'ADMIN'
        ? [{ label: 'My Learning', href: '/my-learning', icon: 'school' }]
        : [];

    const adminLinks = user && activeRole === 'ADMIN'
        ? [{ label: 'Admin Dashboard', href: '/admin', icon: 'dashboard' }]
        : [];

    const allLinks = [...publicLinks, ...studentLinks, ...adminLinks];
    const isHomePage = pathname === '/';
    // Use dark text on light backgrounds (not scrolled and not on homepage)
    const baseTextColor = (scrolled || isHomePage) ? "text-slate-300" : "text-slate-600";
    const logoTextColor = (scrolled || isHomePage) ? "text-white" : "text-slate-900";

    return (
        <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ top: 'var(--banner-height, 0px)' }}
            className={cn(
                "fixed inset-x-0 z-50 transition-all duration-500 ease-in-out",
                scrolled
                    ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                    : "bg-transparent"
            )}
        >
            <div className="w-full pl-4 sm:pl-6 lg:pl-10 xl:pl-12 pr-3 sm:pr-4 lg:pr-6 py-4">
                <div className="flex justify-between items-center">
                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center gap-3 group shrink-0">
                        {/* E ring logo – matches hero */}
                        <motion.div
                            whileHover={{ rotate: 8, scale: 1.08 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 dark:bg-[#1e293b] border border-primary/30 shadow-[0_0_12px_rgba(13,185,242,0.2)]"
                        >
                            <span className="text-primary text-lg font-black">E</span>
                        </motion.div>
                        <div className="flex flex-col">
                            <span className={cn("text-lg font-bold tracking-tight transition-colors duration-300 group-hover:text-primary", logoTextColor)}>
                                Excel Community Living
                            </span>
                            <span className={cn("text-[10px] italic transition-colors duration-300 group-hover:text-primary/80", (scrolled || isHomePage) ? "text-slate-300" : "text-slate-500")}>
                                Knowledge produces quality care
                            </span>
                        </div>
                    </Link>

                    {/* ── Desktop Nav Links (icon + label, Nordic-ICT style) ── */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                        {allLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center gap-1.5 px-3 lg:px-4 py-2 text-sm font-medium transition-colors duration-300 relative",
                                        isActive ? "text-primary" : cn(baseTextColor, "hover:text-primary")
                                    )}
                                >
                                    <span className={cn(
                                        "material-symbols-outlined text-[18px] transition-all duration-300",
                                        isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:text-primary"
                                    )}>
                                        {link.icon}
                                    </span>
                                    {link.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-pill"
                                            className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ── Right side: search, theme, auth ── */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="ml-1">
                                <UserDropdown />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 ml-1">
                                <ThemeToggle />
                                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                                    <Link
                                        href="/login"
                                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(13,185,242,0.35)] hover:shadow-[0_0_28px_rgba(13,185,242,0.5)] transition-all duration-300"
                                    >
                                        Log In
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* ── Mobile toggle ── */}
                    <div className="flex items-center gap-2 md:hidden">
                        {!user ? <ThemeToggle /> : <div className="mr-1 mt-0.5"><UserDropdown /></div>}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className={cn(
                                "flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300",
                                (scrolled || isHomePage) ? "text-slate-300 hover:text-primary hover:bg-white/[0.06]" : "text-slate-600 hover:text-primary hover:bg-black/[0.04]"
                            )}
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {mobileOpen ? 'close' : 'menu'}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Menu ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ top: 'calc(72px + var(--banner-height, 0px))' }}
                        className="md:hidden fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-40 flex flex-col"
                    >
                        <div className="flex-1 px-6 py-10 space-y-4 overflow-y-auto">
                            {/* Links */}
                            {allLinks.map((link, i) => {
                                const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                                return (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 + i * 0.06, duration: 0.4, type: "spring", stiffness: 300, damping: 24 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={cn(
                                                "flex items-center gap-4 px-5 py-4 rounded-2xl text-lg font-bold transition-all duration-300 border",
                                                isActive ? "bg-primary/10 text-primary border-primary/20" : "border-transparent text-slate-300 hover:text-primary hover:bg-white/[0.04]"
                                            )}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            <span className="material-symbols-outlined text-[24px] opacity-80">{link.icon}</span>
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                );
                            })}

                            {/* Auth buttons for logged-out users */}
                            {!user && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 + allLinks.length * 0.06, duration: 0.4 }}
                                    className="mt-8 pt-8 border-t border-white/[0.06]"
                                >
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center rounded-2xl bg-primary px-4 py-4 text-base font-bold text-white hover:bg-primary/90 shadow-[0_0_30px_rgba(13,185,242,0.3)] transition-all duration-300"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Log in to Portal
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
