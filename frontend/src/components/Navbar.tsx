'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { Menu, X, GraduationCap, LogOut, LayoutDashboard, BookOpen, Award } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 text-blue-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                        <GraduationCap className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">CNA Pro</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden gap-8 md:flex">
                    {user?.role !== 'ADMIN' && (
                        <Link href="/courses" className="text-sm font-medium text-slate-300 transition hover:text-white">
                            Courses
                        </Link>
                    )}
                    {user && user.role !== 'ADMIN' && (
                        <>
                            <Link href="/my-courses" className="text-sm font-medium text-slate-300 transition hover:text-white">
                                My Learning
                            </Link>
                            <Link href="/certificates" className="text-sm font-medium text-slate-300 transition hover:text-white">
                                Certificates
                            </Link>
                        </>
                    )}
                    {user?.role === 'ADMIN' && (
                        <Link href="/admin" className="text-sm font-medium text-slate-300 transition hover:text-white">
                            Admin Dashboard
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="hidden items-center gap-3 md:flex">
                            <span className="text-sm font-medium text-slate-200">
                                {user.name}
                            </span>
                            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300 uppercase">
                                {user.role}
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-red-400 transition"
                            >
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="hidden gap-3 md:flex">
                            <Link
                                href="/login"
                                className="text-sm font-semibold text-slate-300 transition hover:text-white"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="flex h-10 items-center justify-center rounded-lg bg-blue-900 px-5 text-sm font-bold text-white transition hover:bg-blue-800"
                            >
                                Apply Now
                            </Link>
                        </div>
                    )}

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden text-slate-300"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-white/10 bg-slate-900/95 px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-3">
                        {user?.role !== 'ADMIN' && (
                            <Link href="/courses" className="flex items-center gap-2 text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>
                                <BookOpen className="h-4 w-4" /> Courses
                            </Link>
                        )}
                        {user && user.role !== 'ADMIN' && (
                            <>
                                <Link href="/my-courses" className="flex items-center gap-2 text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>
                                    <LayoutDashboard className="h-4 w-4" /> My Learning
                                </Link>
                                <Link href="/certificates" className="flex items-center gap-2 text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>
                                    <Award className="h-4 w-4" /> Certificates
                                </Link>
                            </>
                        )}
                        {user?.role === 'ADMIN' && (
                            <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>
                                <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                            </Link>
                        )}
                        {user ? (
                            <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 text-sm font-medium text-red-400">
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-slate-300" onClick={() => setMobileOpen(false)}>Log In</Link>
                                <Link href="/register" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white text-center" onClick={() => setMobileOpen(false)}>Apply Now</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
