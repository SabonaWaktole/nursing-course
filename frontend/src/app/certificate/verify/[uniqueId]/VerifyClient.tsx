'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
    const verifyUrl = currentUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/certificate/verify/${cert.uniqueId}`;

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
                    <Link href="/my-learning?tab=courses" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium">Dashboard</Link>
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

                {/* The Certificate */}
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
                        {/* Subtle outer border */}
                        <div className="absolute inset-0 border border-slate-200/60 pointer-events-none z-10"></div>

                        {/* Geometric triangles in top-left corner */}
                        <svg className="absolute top-0 left-0 pointer-events-none z-0" width="280" height="260" viewBox="0 0 280 260" fill="none">
                            {/* Large faint triangle */}
                            <polygon points="0,0 240,0 0,220" fill="#c8dce8" opacity="0.25" />
                            {/* Medium triangle */}
                            <polygon points="0,0 180,0 0,160" fill="#b4cede" opacity="0.20" />
                            {/* Small darker triangle */}
                            <polygon points="0,0 110,0 0,100" fill="#a0bfd4" opacity="0.22" />
                            {/* Tiny accent triangle */}
                            <polygon points="0,0 55,0 0,50" fill="#8db3c9" opacity="0.18" />
                        </svg>

                        {/* Subtle bottom-right geometric accent */}
                        <svg className="absolute bottom-0 right-0 pointer-events-none z-0" width="120" height="110" viewBox="0 0 120 110" fill="none">
                            <polygon points="120,110 120,30 40,110" fill="#c8dce8" opacity="0.12" />
                            <polygon points="120,110 120,60 60,110" fill="#b4cede" opacity="0.10" />
                        </svg>

                        {/* Content */}
                        <div className="relative z-20 flex flex-col items-center justify-between h-full py-[5%] px-[7%] text-center">

                            {/* Header: Org info top-left */}
                            <div className="w-full text-left mb-2">
                                <h3 className="text-slate-800 font-bold text-[clamp(12px,1.6vw,16px)] leading-tight tracking-tight">
                                    {cert.organizationName}
                                </h3>
                                {cert.organizationAddress && (
                                    <p className="text-[clamp(8px,1vw,11px)] text-slate-400 mt-0.5 leading-snug">
                                        {cert.organizationAddress}
                                    </p>
                                )}
                                {cert.providerId && (
                                    <p className="text-[clamp(8px,1vw,11px)] text-slate-400 mt-0.5 leading-snug">
                                        Provider ID: {cert.providerId}
                                    </p>
                                )}
                            </div>

                            {/* Title */}
                            <div className="flex flex-col items-center gap-1 mt-1">
                                <h2
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                    className="text-[clamp(22px,3.5vw,36px)] font-semibold italic text-slate-800 tracking-wide leading-tight"
                                >
                                    Certificate of Completion
                                </h2>
                            </div>

                            {/* Body */}
                            <div className="flex flex-col items-center gap-2 w-full max-w-3xl -mt-1">
                                {/* "This is to certify that" */}
                                <p className="text-slate-400 text-[clamp(7px,1vw,11px)] uppercase tracking-[0.25em] font-medium">
                                    This is to certify that
                                </p>

                                {/* Student name */}
                                <div className="relative py-1 w-full">
                                    <h3
                                        style={{ fontFamily: "'Great Vibes', cursive" }}
                                        className="text-[clamp(28px,5vw,52px)] text-slate-800 leading-tight"
                                    >
                                        {cert.studentName}
                                    </h3>
                                </div>

                                {/* "Has successfully completed..." */}
                                <p className="text-slate-400 text-[clamp(7px,1vw,11px)] uppercase tracking-[0.2em] font-medium mt-0">
                                    Has successfully completed the training program
                                </p>

                                {/* Course name */}
                                <h4
                                    style={{ fontFamily: "'Playfair Display', serif" }}
                                    className="text-[clamp(14px,2.2vw,22px)] font-medium italic text-[#5a8fa8] max-w-2xl mx-auto leading-snug mt-0"
                                >
                                    {cert.courseName}
                                </h4>
                            </div>

                            {/* Bottom: Date | QR Code | Signature */}
                            <div className="w-full flex items-end justify-between mb-[6%] px-[2%] relative z-20">
                                {/* Date */}
                                <div className="flex flex-col items-center gap-0.5 min-w-[25%]">
                                    <p
                                        style={{ fontFamily: "'Playfair Display', serif" }}
                                        className="text-[clamp(10px,1.4vw,15px)] font-medium italic text-slate-700 pb-1.5 w-full text-center"
                                    >
                                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <div className="w-full h-px bg-slate-300"></div>
                                    <p className="text-[clamp(6px,0.8vw,9px)] uppercase tracking-[0.2em] text-slate-400 font-medium mt-1">
                                        Date Issued
                                    </p>
                                </div>

                                {/* QR Code */}
                                <div className="flex flex-col items-center gap-1.5 mx-4">
                                    <div className="p-1 border border-slate-100 rounded-md bg-white">
                                        <QRCodeSVG
                                            value={verifyUrl}
                                            size={72}
                                            level="M"
                                            fgColor="#4a8da8"
                                            bgColor="#ffffff"
                                            className="w-[clamp(48px,8vw,72px)] h-[clamp(48px,8vw,72px)]"
                                        />
                                    </div>
                                    <p className="text-[clamp(5px,0.7vw,8px)] uppercase tracking-[0.15em] text-[#4a8da8] font-semibold">
                                        Scan to Verify
                                    </p>
                                </div>

                                {/* Signature */}
                                <div className="flex flex-col items-center gap-0.5 min-w-[25%]">
                                    <div className="w-full flex items-end justify-center pb-1.5">
                                        <span
                                            style={{ fontFamily: "'Great Vibes', cursive" }}
                                            className="text-[clamp(16px,2.5vw,26px)] text-slate-700"
                                        >
                                            {cert.directorName}
                                        </span>
                                    </div>
                                    <div className="w-full h-px bg-slate-300"></div>
                                    {cert.directorTitle && (
                                        <p className="text-[clamp(6px,0.8vw,9px)] uppercase tracking-[0.15em] text-slate-400 font-medium mt-1">
                                            {cert.directorTitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer: Retention text + Credential ID */}
                            <div className="w-full flex flex-col items-center gap-0.5 mt-3">
                                <p className="text-[clamp(6px,0.75vw,9px)] text-slate-400 font-medium italic leading-snug">
                                    This record shall be retained by CNA or HHA employer for (4) years starting from the date of enrollment.
                                </p>
                                <p className="font-mono text-[clamp(6px,0.7vw,8px)] text-slate-300">
                                    Credential ID: {cert.uniqueId} &bull; {cert.organizationName}
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
