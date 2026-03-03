'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
            setMobileOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl">medical_services</span>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Excelcommunity Living Inc</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/courses" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Courses</Link>
                        <Link href="/certificates" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Certifications</Link>
                        {user && user.role !== 'ADMIN' && (
                            <Link href="/my-courses" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">My Learning</Link>
                        )}
                        {user && user.role === 'ADMIN' && (
                            <Link href="/admin" className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Admin</Link>
                        )}
                    </nav>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Phone Number */}
                        <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-lg text-sm transition-colors hover:bg-primary/20 cursor-pointer">
                            <span className="material-symbols-outlined text-xl">phone</span>
                            <span>1661-600-5354</span>
                        </div>

                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link href="/settings" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-symbols-outlined text-xl leading-none">settings</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <span className="material-symbols-outlined text-xl leading-none">logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className="text-sm font-semibold px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">Login</Link>
                                <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/25 transition-all">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle />
                        <button
                            className="p-2 rounded-lg text-slate-700 dark:text-slate-300"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {mobileOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 py-4 md:hidden shadow-xl max-h-[80vh] overflow-y-auto">
                    {/* Phone Number */}
                    <div className="flex items-center justify-center gap-2 text-primary font-bold bg-primary/10 px-4 py-3 rounded-lg mb-4 cursor-pointer hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined">phone</span>
                        <span>1661-600-5354</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary bg-primary/10" onClick={() => setMobileOpen(false)}>
                            <span className="material-symbols-outlined text-lg">home</span> Home
                        </Link>
                        <Link href="/courses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                            <span className="material-symbols-outlined text-lg">menu_book</span> Courses
                        </Link>
                        <Link href="/certificates" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                            <span className="material-symbols-outlined text-lg">card_membership</span> Certifications
                        </Link>

                        {user && (
                            <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                                <p className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
                                {user.role !== 'ADMIN' ? (
                                    <>
                                        <Link href="/my-courses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                            <span className="material-symbols-outlined text-lg">school</span> My Learning
                                        </Link>
                                        <Link href="/certificates" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                            <span className="material-symbols-outlined text-lg">workspace_premium</span> Certificates
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                        <span className="material-symbols-outlined text-lg">dashboard</span> Admin Dashboard
                                    </Link>
                                )}
                                <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
                                    <span className="material-symbols-outlined text-lg">settings</span> Settings
                                </Link>
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-1">
                                    <span className="material-symbols-outlined text-lg">logout</span> Logout
                                </button>
                            </div>
                        )}

                        {!user && (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link href="/login" className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Login</Link>
                                <Link href="/register" className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/25" onClick={() => setMobileOpen(false)}>Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
