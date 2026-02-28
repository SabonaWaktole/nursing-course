'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { Menu, X, Phone, Mail, Facebook, Instagram, Search, LogOut, Settings, LayoutDashboard, BookOpen, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm flex flex-col">
            {/* Top Black Contact Bar */}
            <div className="hidden w-full bg-[#1c2128] py-2 md:block">
                <div className="mx-auto flex max-w-7xl items-center justify-end gap-8 px-4 sm:px-6 lg:px-8 text-xs font-medium text-slate-300">
                    <a href="tel:6616005354" className="flex items-center gap-2 hover:text-white transition">
                        <Phone className="h-3.5 w-3.5 text-red-500" /> Call: (661) 600-5354
                    </a>
                    <a href="mailto:admin@excelcommunitylivinginc.com" className="flex items-center gap-2 hover:text-white transition">
                        <Mail className="h-3.5 w-3.5 text-red-500" /> Email: admin@excelcommunitylivinginc.com
                    </a>
                    <div className="flex items-center gap-3 ml-4 border-l border-slate-600 pl-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                            <Facebook className="h-4 w-4" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                            <Instagram className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo Area */}
                <Link href="/" className="flex flex-col items-start justify-center text-slate-900 group">
                    <span className="text-xl md:text-2xl font-black leading-none tracking-tight">Excel <span className="font-extrabold text-slate-700">Community Living, Inc.</span></span>
                    <span className="text-[10px] md:text-sm font-semibold tracking-wide text-slate-600 mt-0.5">Continuing Education for <span className="font-black text-slate-900">ARF</span></span>
                </Link>

                {/* Center Links (Desktop) */}
                <nav className="hidden items-center gap-8 md:flex">
                    <Link href="/" className="text-sm font-bold text-teal-500 transition hover:text-teal-600">Home</Link>

                    <div className="relative group flex items-center gap-1 cursor-pointer text-sm font-bold text-slate-800 transition hover:text-teal-600">
                        <Link href="/courses">Courses</Link>
                        <svg className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>

                        {/* Simple Dropdown for authenticated items */}
                        {user && (
                            <div className="absolute top-full left-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="py-1">
                                    {user.role !== 'ADMIN' && (
                                        <>
                                            <Link href="/my-courses" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">My Learning</Link>
                                            <Link href="/certificates" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Certificates</Link>
                                        </>
                                    )}
                                    {user.role === 'ADMIN' && (
                                        <Link href="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Admin Dashboard</Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="#contact" className="text-sm font-bold text-slate-800 transition hover:text-teal-600">Contact Us</Link>
                </nav>

                {/* Right Area (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex items-center border border-slate-200 rounded-sm focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition ml-4">
                        <input
                            type="text"
                            placeholder="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-32 lg:w-48 px-4 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none bg-transparent"
                        />
                        <button type="submit" className="p-2.5 text-slate-500 hover:text-slate-900 border-l border-slate-200 bg-slate-50 transition">
                            <Search className="h-4 w-4" />
                        </button>
                    </form>

                    {/* Authentication Status CTA */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/settings" title="Settings" className="text-slate-400 hover:text-teal-600 transition">
                                <Settings className="h-5 w-5" />
                            </Link>
                            <button
                                onClick={logout}
                                title="Logout"
                                className="text-slate-400 hover:text-red-500 transition"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                            <Link href="/courses" className="h-10 px-6 inline-flex items-center justify-center rounded-sm bg-teal-500 text-sm font-bold text-white transition hover:bg-teal-600">
                                My Account
                            </Link>
                        </div>
                    ) : (
                        <Link href="/register" className="h-10 px-6 inline-flex items-center justify-center rounded-sm bg-teal-500 text-sm font-bold text-white transition hover:bg-teal-600">
                            Try for Free
                        </Link>
                    )}
                </div>

                {/* Mobile toggle button */}
                <div className="flex items-center gap-4 md:hidden">
                    <button
                        className="text-slate-800 p-2"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden shadow-xl max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSearch} className="flex items-center border border-slate-300 rounded mb-4 focus-within:border-teal-500">
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 text-sm focus:outline-none"
                        />
                        <button type="submit" className="p-3 text-slate-500 bg-slate-100 border-l border-slate-300">
                            <Search className="h-5 w-5" />
                        </button>
                    </form>

                    <div className="flex flex-col gap-2">
                        <Link href="/" className="px-3 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded" onClick={() => setMobileOpen(false)}>Home</Link>
                        <Link href="/courses" className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileOpen(false)}>All Courses</Link>
                        <Link href="#contact" className="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileOpen(false)}>Contact Us</Link>

                        {user && (
                            <div className="border-t border-slate-100 my-2 pt-2">
                                <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                                {user.role !== 'ADMIN' ? (
                                    <>
                                        <Link href="/my-courses" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileOpen(false)}>
                                            <BookOpen className="h-4 w-4 text-slate-400" /> My Learning
                                        </Link>
                                        <Link href="/certificates" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileOpen(false)}>
                                            <Award className="h-4 w-4 text-slate-400" /> Certificates
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileOpen(false)}>
                                        <LayoutDashboard className="h-4 w-4 text-slate-400" /> Admin Dashboard
                                    </Link>
                                )}
                                <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded" onClick={() => setMobileOpen(false)}>
                                    <Settings className="h-4 w-4 text-slate-400" /> Settings
                                </Link>
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded mt-1">
                                    <LogOut className="h-4 w-4 text-red-400" /> Logout
                                </button>
                            </div>
                        )}

                        {!user && (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                                <Link href="/login" className="flex items-center justify-center rounded border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Log In</Link>
                                <Link href="/register" className="flex items-center justify-center rounded bg-teal-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600" onClick={() => setMobileOpen(false)}>Try for Free</Link>
                            </div>
                        )}

                        {/* Mobile Contact Info Block */}
                        <div className="mt-6 p-4 bg-slate-900 rounded-lg text-white space-y-3">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Support</p>
                            <a href="tel:6616005354" className="flex items-center gap-2 text-sm hover:text-teal-400 transition">
                                <Phone className="h-4 w-4 text-teal-500" /> (661) 600-5354
                            </a>
                            <a href="mailto:admin@excelcommunitylivinginc.com" className="flex items-center gap-2 text-sm hover:text-teal-400 transition break-all">
                                <Mail className="h-4 w-4 text-teal-500 shrink-0" /> admin@excelcommunitylivinginc.com
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
