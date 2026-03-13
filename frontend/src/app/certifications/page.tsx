'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CertificationsPage() {
    const [certificateId, setCertificateId] = useState('');
    const [error, setError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = certificateId.trim();
        if (!trimmed) {
            setError('Please enter a certificate ID to verify.');
            return;
        }
        setError('');
        setIsSearching(true);
        // Navigate to the verification page
        router.push(`/certificate/verify/${encodeURIComponent(trimmed)}`);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col relative overflow-hidden">
            {/* Floating Ambient Orbs */}
            <motion.div
                animate={{ y: [0, -40, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[-8%] right-[-5%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{ y: [0, 30, 0], x: [0, -25, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="absolute bottom-[-10%] left-[-8%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none"
            />
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none"
            />

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                        </span>
                        Official Verification Portal
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
                        Verify a{' '}
                        <span className="text-primary relative whitespace-nowrap">
                            Certificate
                            <motion.svg
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
                                className="absolute w-full h-3 -bottom-1 left-0 text-primary/30"
                                viewBox="0 0 100 10"
                                preserveAspectRatio="none"
                            >
                                <path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </motion.svg>
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        Enter the unique Certificate ID to instantly verify the authenticity and status of any credential issued by Excelcommunity Living Inc.
                    </p>
                </motion.div>

                {/* Search Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-8 md:p-10">
                        {/* Subtle glow behind card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-emerald-500/20 rounded-3xl blur-2xl opacity-40 -z-10" />

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label htmlFor="certificate-id" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    Certificate ID
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-500" />
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                                            <span className="material-symbols-outlined text-xl">search</span>
                                        </span>
                                        <input
                                            id="certificate-id"
                                            type="text"
                                            value={certificateId}
                                            onChange={(e) => { setCertificateId(e.target.value); setError(''); }}
                                            placeholder="e.g. cmmny197v0001k2j8fnd90nzd"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-mono"
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 text-sm text-red-500 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {error}
                                    </motion.p>
                                )}
                            </div>

                            <motion.button
                                type="submit"
                                disabled={isSearching}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSearching ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">verified</span>
                                        Verify Certificate
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Helper Text */}
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                You can find the Certificate ID at the bottom of any certificate issued by our platform, or in the student&apos;s Certificates dashboard.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full"
                >
                    {[
                        {
                            icon: 'shield',
                            title: 'Tamper-Proof',
                            desc: 'Every credential is cryptographically secured and stored in our central database.',
                        },
                        {
                            icon: 'verified_user',
                            title: 'Instantly Verified',
                            desc: 'Real-time validation against our issuing registry ensures authenticity.',
                        },
                        {
                            icon: 'public',
                            title: 'Globally Recognized',
                            desc: 'Share your verified credential with any employer or institution worldwide.',
                        },
                    ].map((badge, i) => (
                        <motion.div
                            key={badge.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-primary text-2xl">{badge.icon}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{badge.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{badge.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10"
                >
                    <Link
                        href="/"
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Home
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
