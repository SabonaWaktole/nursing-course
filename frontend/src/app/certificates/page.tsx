'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Certificate } from '@/lib/types';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import StudentSidebar from '@/components/StudentSidebar';
import StudentHeader from '@/components/StudentHeader';
import { useSectionContainerVariants, useSectionItemVariants, useCardHoverMotion, useButtonHoverMotion, viewportOnce } from '@/lib/motion';

export default function CertificatesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const sectionContainer = useSectionContainerVariants();
    const sectionItem = useSectionItemVariants();
    const cardHover = useCardHoverMotion();
    const buttonHover = useButtonHoverMotion();

    useEffect(() => {
        if (!user) return;
        api.get('/certificates/my').then((res) => {
            setCertificates(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user, router]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
        </div>
    );

    return (
        <RoleGuard allowedRoles={['STUDENT']}>
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200 relative"
            >
                <StudentSidebar
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <StudentHeader title="My Certifications" subtitle="Official training records and credentials." icon="workspace_premium" onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />
                    <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            <motion.header
                                variants={sectionItem}
                                initial="hidden"
                                animate="show"
                                className="mb-10"
                            >
                                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">My Certifications</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">Official training records and credentials earned through Excel Community Living Inc.</p>
                            </motion.header>

                            {certificates.length === 0 ? (
                                <motion.div
                                    variants={sectionItem}
                                    initial="hidden"
                                    animate="show"
                                    className="text-center py-24 rounded-[2rem] border-2 border-dashed border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm"
                                >
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-6 text-slate-300">
                                        <span className="material-symbols-outlined text-5xl">workspace_premium</span>
                                    </div>
                                    <p className="text-xl font-bold text-slate-800">No certificates yet</p>
                                    <p className="mt-2 text-slate-500 max-w-sm mx-auto">Complete course modules and pass your final exams to earn official nursing credentials.</p>
                                    <motion.span {...buttonHover}>
                                        <Link href="/courses" className="mt-8 inline-flex items-center gap-2 text-primary font-bold hover:underline">
                                            Browse Courses <span className="material-symbols-outlined">arrow_forward</span>
                                        </Link>
                                    </motion.span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    variants={sectionContainer}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={viewportOnce}
                                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                                >
                                    {certificates.map((cert) => (
                                        <motion.div
                                            key={cert.id}
                                            variants={sectionItem}
                                            {...cardHover}
                                            className="group relative overflow-hidden rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] transition-all duration-300"
                                        >
                                            {/* Shimmer shine overlay */}
                                            <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden rounded-2xl">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                            </div>
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-blue-400"></div>

                                            <div className="flex items-start gap-5 mb-6">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 shrink-0 group-hover:bg-blue-900 group-hover:text-white transition-colors">
                                                    <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">{cert.course.title}</h3>
                                                    <p className="text-xs text-slate-400 mt-2 font-mono flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">id_card</span>
                                                        {cert.uniqueId}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Issue Date</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-400">Status</span>
                                                    <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${cert.status === 'APPROVED' ? 'text-emerald-600' :
                                                        cert.status === 'REJECTED' ? 'text-rose-600' :
                                                            'text-amber-600'
                                                        }`}>
                                                        <motion.span
                                                            animate={cert.status === 'APPROVED' ? { scale: [1, 1.15, 1] } : {}}
                                                            transition={cert.status === 'APPROVED' ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                                                            className="material-symbols-outlined text-[14px]"
                                                        >
                                                            {cert.status === 'APPROVED' ? 'check_circle' :
                                                                cert.status === 'REJECTED' ? 'cancel' :
                                                                    'pending'}
                                                        </motion.span>
                                                        {cert.status || 'PENDING'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex gap-3">
                                                {cert.status === 'APPROVED' ? (
                                                    <>
                                                        <motion.span {...buttonHover} className="flex-1">
                                                            <Link
                                                                href={`/certificate/verify/${cert.uniqueId}`}
                                                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 shadow-md shadow-primary/20 transition-colors duration-200"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                                View & Print
                                                            </Link>
                                                        </motion.span>
                                                        <motion.button
                                                            {...buttonHover}
                                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/download/${cert.id}`)}
                                                            className="flex items-center justify-center size-12 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors duration-200"
                                                            title="Download PDF"
                                                        >
                                                            <span className="material-symbols-outlined">download</span>
                                                        </motion.button>
                                                    </>
                                                ) : (
                                                    <div className="flex-1 text-center py-3 bg-slate-50 rounded-xl text-slate-400 text-xs font-bold border border-slate-100 italic">
                                                        {cert.status === 'REJECTED' ? 'Certificate Rejected' : 'Awaiting Admin Approval'}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </main>
                </div>
            </motion.div>
        </RoleGuard>
    );
}
