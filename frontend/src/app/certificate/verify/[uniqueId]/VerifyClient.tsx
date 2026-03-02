'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function VerifyClient({ result }: { result: any }) {
    const handlePrint = () => {
        window.print();
    };

    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    if (!result?.valid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
                <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-lg">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 mb-6">
                        <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid Certificate</h1>
                    <p className="text-slate-500 mb-8">This certificate ID does not exist or has been revoked. Please check the ID and try again.</p>
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const cert = result.certificate;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white flex flex-col"
        >
            {/* Header - Hide on print */}
            <header className="no-print sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-10 py-3 shadow-sm flex items-center justify-between whitespace-nowrap backdrop-blur">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-3xl">medical_services</span>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Excelcommunity Living Inc</span>
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-9">
                    <Link href="/courses" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Courses</Link>
                    <Link href="/my-courses" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Dashboard</Link>
                </nav>
            </header>

            <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-8">
                {/* Breadcrumbs and Actions - Hide on print */}
                <div className="w-full max-w-5xl mb-8 no-print">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link href="/" className="hover:text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">home</span> Home
                        </Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">Verification</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Certificate Verification</h1>
                            <p className="text-slate-600 dark:text-slate-400">Verified official record for <span className="font-semibold text-slate-800 dark:text-slate-200">{cert.studentName}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-semibold text-sm shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                Download PDF / Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* The Certificate Wrapper */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-5xl flex justify-center mb-12"
                >
                    <div
                        id="certificate-container"
                        className="relative bg-white text-slate-900 w-full max-w-[900px] aspect-[1.414/1] shadow-2xl rounded-sm overflow-hidden flex flex-col"
                    >
                        {/* Borders - using primary teal color */}
                        <div className="absolute inset-4 border-[3px] border-double border-primary/20 pointer-events-none z-10"></div>
                        <div className="absolute inset-6 border border-primary/10 pointer-events-none z-10"></div>

                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>

                        {/* Corner Accents - teal primary */}
                        <div className="absolute top-0 left-0 size-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 size-32 bg-gradient-to-tl from-primary/10 to-transparent pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative z-20 flex flex-col items-center justify-between h-full py-12 px-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 text-primary mb-1">
                                    <span className="material-symbols-outlined text-4xl">medical_services</span>
                                    <span className="text-xl font-bold tracking-tight text-slate-800">Excelcommunity Living Inc</span>
                                </div>
                                <h2 className="text-3xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide uppercase leading-tight">
                                    Certificate of Completion<br />
                                    <span className="text-xl md:text-2xl font-semibold text-slate-700">Professional Training Program</span>
                                </h2>
                                <div className="h-1 w-24 bg-primary rounded-full mt-2"></div>
                            </div>

                            <div className="flex flex-col gap-4 w-full max-w-3xl">
                                <p className="text-slate-500 text-lg uppercase tracking-widest font-medium">This is to certify that</p>
                                <div className="relative py-2">
                                    <h3 style={{ fontFamily: "'Great Vibes', cursive" }} className="text-5xl md:text-7xl text-slate-900 leading-tight p-2">
                                        {cert.studentName}
                                    </h3>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-slate-200"></div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-slate-500 text-base uppercase tracking-widest font-medium">Has successfully completed the approved training program for</p>
                                    <h4 className="text-2xl md:text-3xl font-bold text-primary max-w-2xl mx-auto leading-snug">
                                        {cert.courseName}
                                    </h4>
                                    <div className="flex justify-center mt-2">
                                        <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-xl">verified</span>
                                            <span className="text-slate-700 font-semibold">Authenticated Record ✓</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex items-end justify-between mt-6 px-4">
                                <div className="flex flex-col items-center gap-2 min-w-[160px]">
                                    <p className="text-lg font-semibold text-slate-800 border-b border-slate-300 pb-1 w-full text-center">
                                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Date Issued</p>
                                </div>

                                <div className="relative size-24 md:size-32">
                                    <svg className="w-full h-full text-primary" fill="none" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeDasharray="4 2" strokeWidth="2"></circle>
                                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1"></circle>
                                        <path d="M50 35V75M40 45H60" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-[10px] font-bold text-primary tracking-tighter uppercase text-center w-20 leading-3 mt-12">Registry Verified</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 min-w-[160px]">
                                    <div className="h-10 w-full flex items-end justify-center">
                                        <span style={{ fontFamily: "'Great Vibes', cursive" }} className="text-4xl text-slate-800 -rotate-2 transform">Administrator</span>
                                    </div>
                                    <div className="border-b border-slate-300 w-full"></div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">Program Director</p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-0 w-full text-center">
                                <p className="font-mono text-[10px] text-slate-400">Credential ID: {cert.uniqueId} • Excelcommunity Living Inc</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Status Section - Hide on print */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-semibold">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            Registry Verification
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600 flex items-center gap-1 mb-1">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Valid Official Document
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">This certificate is a valid, recognized credential and has been successfully matched against our central database.</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-semibold">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">share</span>
                            </div>
                            Share Credential
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Allow others to verify this credential by sharing this unique link or ID.</p>
                        <div className="mt-auto">
                            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <code className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">{currentUrl}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(currentUrl)}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                                >
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    #certificate-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        max-width: none;
                        max-height: none;
                        box-shadow: none !important;
                        border: none !important;
                        transform: none !important;
                    }
                }
            `}</style>
        </motion.div>
    );
}
