'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { user, logout, activeRole } = useAuth();
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
        ? [{ label: 'My Learning', href: '/my-courses', icon: 'school' }]
        : [];

    const adminLinks = user && activeRole === 'ADMIN'
        ? [{ label: 'Admin Dashboard', href: '/admin', icon: 'dashboard' }]
        : [];

    const allLinks = [...publicLinks, ...studentLinks, ...adminLinks];

    return (
        <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out",
                scrolled
                    ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                            <span className="text-lg font-bold tracking-tight text-white group-hover:text-primary transition-colors duration-300">
                                Excel Community Living
                            </span>
                            <span className="text-[10px] italic text-slate-300 group-hover:text-primary/80 transition-colors duration-300">
                                Knowledge produces quality care
                            </span>
                        </div>
                    </Link>

                    {/* ── Desktop Nav Links (icon + label, Nordic-ICT style) ── */}
                    <nav className="hidden md:flex items-center gap-1 lg:gap-2">
                        {allLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group flex items-center gap-1.5 px-3 lg:px-4 py-2 text-sm font-medium text-slate-300 hover:text-primary transition-colors duration-300 relative"
                            >
                                <span className="material-symbols-outlined text-[18px] opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all duration-300">
                                    {link.icon}
                                </span>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* ── Right side: search, theme, auth ── */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-1">
                                <Link
                                    href="/settings"
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white font-bold flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.3)] border border-primary/20 shrink-0 transition-shadow hover:shadow-[0_0_20px_rgba(13,185,242,0.5)]"
                                    title="Account Settings"
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Link>
                            </motion.div>
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
                        {!user && <ThemeToggle />}
                        {user && (
                            <Link 
                                href="/settings" 
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-[12px] text-white font-bold flex items-center justify-center shadow-[0_0_10px_rgba(13,185,242,0.3)] shrink-0 mr-1"
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Link>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center h-10 w-10 rounded-full text-slate-300 hover:text-primary hover:bg-white/[0.06] transition-all duration-300"
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
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
                        className="md:hidden overflow-hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/[0.06]"
                    >
                        <div className="px-5 py-6 space-y-2">
                            {/* Links */}
                            {allLinks.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 + i * 0.06, duration: 0.3 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-primary hover:bg-white/[0.04] transition-all duration-300"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span className="material-symbols-outlined text-[20px] opacity-70">{link.icon}</span>
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Auth buttons for logged-out users */}
                            {!user && (
                                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                    <Link
                                        href="/login"
                                        className="flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Log in
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
