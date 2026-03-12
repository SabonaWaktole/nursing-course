'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
            setMobileOpen(false);
        }
    };

    return (
        <motion.header
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out",
                scrolled
                    ? "bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-[0_18px_45px_rgba(15,23,42,0.35)]"
                    : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
                <div className="flex justify-between items-center gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.span 
                            whileHover={{ rotate: 8, scale: 1.05 }}
                            transition={{ duration: 0.35, ease: 'easeInOut' }}
                            className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_26px_rgba(13,185,242,0.65)]"
                        >
                            medical_services
                        </motion.span>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            Excelcommunity Living Inc
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2 rounded-full bg-slate-900/3 dark:bg-slate-900/70 px-2 py-1.5 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-2xl shadow-[0_10px_35px_rgba(15,23,42,0.22)]">
                        {['Courses', 'Certifications'].map((item) => (
                            <Link 
                                key={item} 
                                href={`/${item.toLowerCase()}`}
                                className="relative text-sm font-semibold text-slate-600 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors group px-4 py-1.5 rounded-full"
                            >
                                {item}
                                <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary/90 transition-all duration-300 group-hover:opacity-100 opacity-0 rounded-full"></span>
                            </Link>
                        ))}
                        
                        {user && user.role !== 'ADMIN' && (
                            <Link href="/my-courses" className="relative text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors group px-4 py-1.5 rounded-full">
                                My Learning
                                <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary transition-all duration-300 group-hover:opacity-100 opacity-0 rounded-full"></span>
                            </Link>
                        )}
                        {user && user.role === 'ADMIN' && (
                            <Link href="/admin" className="relative text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary transition-colors group px-4 py-1.5 rounded-full">
                                Admin Dashboard
                                <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary transition-all duration-300 group-hover:opacity-100 opacity-0 rounded-full"></span>
                            </Link>
                        )}
                    </nav>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 lg:w-64 pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 transition-all duration-300 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]"
                            />
                        </form>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link href="/settings" className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                        <span className="material-symbols-outlined text-xl leading-none">settings</span>
                                    </Link>
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={logout}
                                    className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <span className="material-symbols-outlined text-xl leading-none">logout</span>
                                </motion.button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-2">
                                <Link href="/login" className="text-sm font-bold px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">Log In</Link>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                    <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_18px_35px_rgba(13,185,242,0.45)] transition-all">
                                        Get Started
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 justify-center flex items-center h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {mobileOpen ? 'close' : 'menu'}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 md:hidden shadow-2xl overflow-hidden mt-4 rounded-b-3xl"
                    >
                        <form onSubmit={handleSearch} className="relative mb-6">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm font-medium"
                            />
                        </form>

                        <div className="flex flex-col gap-2">
                            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-primary bg-primary/10" onClick={() => setMobileOpen(false)}>
                                <span className="material-symbols-outlined text-[20px]">home</span> Home
                            </Link>
                            <Link href="/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                <span className="material-symbols-outlined text-[20px]">menu_book</span> Courses
                            </Link>
                            <Link href="/certificates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                <span className="material-symbols-outlined text-[20px]">workspace_premium</span> Certifications
                            </Link>

                            {user && (
                                <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4">
                                    <p className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Dashboard</p>
                                    {user.role !== 'ADMIN' ? (
                                        <>
                                            <Link href="/my-courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                                <span className="material-symbols-outlined text-[20px]">school</span> My Learning
                                            </Link>
                                        </>
                                    ) : (
                                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                            <span className="material-symbols-outlined text-[20px]">dashboard</span> Admin Hub
                                        </Link>
                                    )}
                                    <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                        <span className="material-symbols-outlined text-[20px]">settings</span> Settings
                                    </Link>
                                    <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-sm font-bold text-red-500 bg-red-50/50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 mt-2">
                                        <span className="material-symbols-outlined text-[20px]">logout</span> Log out securely
                                    </button>
                                </div>
                            )}

                            {!user && (
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Link href="/login" className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Log in</Link>
                                    <Link href="/register" className="flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/25" onClick={() => setMobileOpen(false)}>Start Learning</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
