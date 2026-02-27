'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Certificate } from '@/lib/types';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

export default function CertificatesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">My Certifications</h1>
                            <p className="text-slate-500 text-lg">Official training records and credentials earned through CareAcademy.</p>
                        </div>
                    </div>

                    {certificates.length === 0 ? (
                        <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-sm">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-6 text-slate-300">
                                <span className="material-symbols-outlined text-5xl">workspace_premium</span>
                            </div>
                            <p className="text-xl font-bold text-slate-800">No certificates yet</p>
                            <p className="mt-2 text-slate-500 max-w-sm mx-auto">Complete course modules and pass your final exams to earn official nursing credentials.</p>
                            <Link href="/courses" className="mt-8 inline-flex items-center gap-2 text-blue-900 font-bold hover:underline">
                                Browse Courses <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {certificates.map((cert) => (
                                <div
                                    key={cert.id}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
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
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <Link
                                            href={`/certificate/verify/${cert.uniqueId}`}
                                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 shadow-md shadow-blue-100 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            View & Print
                                        </Link>
                                        <button
                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/download/${cert.id}`)}
                                            className="flex items-center justify-center size-12 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-blue-900 transition-all"
                                            title="Download PDF"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
