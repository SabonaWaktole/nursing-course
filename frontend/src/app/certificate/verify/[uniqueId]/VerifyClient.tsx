'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function VerifyClient({ uniqueId }: { uniqueId: string }) {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        setCurrentUrl(window.location.href);

        async function verify() {
            if (!uniqueId) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            try {
                const res = await fetch(`${API_URL}/api/certificates/verify/${uniqueId}`);
                if (res.ok) {
                    const data = await res.json();
                    setResult(data);
                } else {
                    setResult({ valid: false });
                }
            } catch (error) {
                console.error("Error verifying certificate:", error);
                setResult({ valid: false });
            } finally {
                setLoading(false);
            }
        }

        verify();
    }, [uniqueId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!result?.valid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
                <div className="max-w-md w-full rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50/50 dark:bg-rose-900/20 mb-6 border border-rose-100 dark:border-rose-900/30">
                        <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
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
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Excel Community Living Inc</span>
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
                        <div className="relative z-20 flex flex-col items-center justify-between h-full py-10 px-12 text-center">
                            
                            {/* Header Section */}
                            <div className="w-full flex justify-between items-start">
                                <div className="text-left max-w-[200px]">
                                    <h3 className="text-primary font-bold text-lg leading-tight">{cert.organizationName || 'Excel Community Living Inc'}</h3>
                                    <p className="text-[10px] text-slate-600 mt-1 leading-snug whitespace-pre-wrap">
                                        {cert.organizationAddress || '123 Health Ave, Suite 100\nCity, State 12345'}
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{cert.organizationPhone || '(555) 123-4567'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-2xl">medical_services</span>
                                        </div>
                                    </div>
                                    {cert.providerId && (
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">Provider ID: {cert.providerId}</p>
                                    )}
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className="flex flex-col items-center gap-2 mt-4">
                                <h2 className="text-3xl md:text-3xl font-serif font-bold text-slate-900 tracking-wide uppercase leading-tight">
                                    Certificate of Completion<br />
                                </h2>
                                <div className="h-1 w-24 bg-primary rounded-full mb-1"></div>
                            </div>

                            {/* Student Section */}
                            <div className="flex flex-col gap-3 w-full max-w-3xl mt-2">
                                <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">This is to certify that</p>
                                <div className="relative py-1">
                                    <h3 style={{ fontFamily: "'Great Vibes', cursive" }} className="text-5xl md:text-6xl text-slate-900 leading-tight p-2">
                                        {cert.studentName}
                                    </h3>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-slate-300"></div>
                                </div>
                                
                                <div className="space-y-4 mt-2">
                                    <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">Has successfully completed the approved training program for</p>
                                    <h4 className="text-2xl font-bold text-primary max-w-2xl mx-auto leading-snug">
                                        {cert.courseName}
                                    </h4>
                                    
                                    <div className="flex justify-center items-center gap-6 mt-3 text-sm font-semibold text-slate-700">
                                        {cert.hoursAttended && (
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
                                                <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
                                                {cert.hoursAttended} Hours Attended
                                            </div>
                                        )}
                                        {cert.certificateNumber && (
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md font-mono">
                                                <span className="material-symbols-outlined text-sm text-slate-400">pin</span>
                                                No: {cert.certificateNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Signatures Section */}
                            <div className="w-full flex items-end justify-between mt-8 px-8 relative z-20">
                                <div className="flex flex-col items-center gap-1 min-w-[160px]">
                                    <p className="text-base font-semibold text-slate-800 border-b border-slate-400 pb-1 w-full text-center">
                                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Date Issued</p>
                                </div>

                                <div className="relative size-24">
                                    <svg className="w-full h-full text-primary opacity-80" fill="none" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeDasharray="4 2" strokeWidth="2"></circle>
                                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1"></circle>
                                        <path d="M50 35V75M40 45H60" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-[8px] font-bold text-primary tracking-tighter uppercase text-center w-16 leading-tight mt-10">Official Seal</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1 min-w-[160px]">
                                    <div className="h-10 w-full flex items-end justify-center relative">
                                        <span style={{ fontFamily: "'Great Vibes', cursive" }} className="text-3xl text-slate-800 -rotate-2 transform relative top-2">
                                            {cert.directorName || 'Administrator'}
                                        </span>
                                    </div>
                                    <div className="border-b border-slate-400 w-full mt-1"></div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{cert.directorTitle || 'Program Director'}</p>
                                </div>
                            </div>

                            {/* Footer & Retention Text */}
                            <div className="absolute bottom-4 left-0 w-full flex flex-col items-center gap-1">
                                <p className="text-[9px] text-slate-500 font-medium italic">
                                    This record shall be retained by CNA or HHA for period of four(4) years starting from the date of enrollment.
                                </p>
                                <p className="font-mono text-[9px] text-slate-400">
                                    Credential ID: {cert.uniqueId}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Status Section - Hide on print */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-semibold">
                            <div className="p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-600 border border-emerald-100/50 dark:border-emerald-800/30">
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

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white font-semibold">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/10">
                                <span className="material-symbols-outlined">share</span>
                            </div>
                            Share Credential
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Allow others to verify this credential by sharing this unique link or ID.</p>
                        <div className="mt-auto">
                            <div className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                                <code className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate ml-1">{currentUrl}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(currentUrl)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors hover:shadow-sm"
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
