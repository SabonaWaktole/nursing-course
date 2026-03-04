'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Enrollment } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import StudentSidebar from '@/components/StudentSidebar';
import StudentHeader from '@/components/StudentHeader';
import { getFileUrl } from '@/lib/url-utils';

const COURSE_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCu-zYmikqqgWp7XL195teqe8TOODyvoboA8HIQmeON3V97MwR-VD5-AxiKyfAPHRYrvXuAX694m8rSKhNDf6Z_e6V1vX809P1f4QmT-DCvV66SOC_ZlAphWkaice6oJ8b9QHPjclKgcJH8q66s9rAFnwymE5hWSi5zsHFnBr-emaAYkjl-6gSxwd6uT1kNx3pDvF1rbUfNE9xLspdMXfQ0AI7IlP1VVqS0aZayH1lszHnmXHDC2uqC0N03CL8FKph-CzKArx9A_-Q",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCI_CYYh32pI0EM3-BQMUwi4LzRc7h4GY4zVoNs8V9PPeKSASBH3fXjn17YER4Y5b5_Ako3l9dxkf8BeAhnvyYBL5KYLnUIHUlwEt4rE9Usn_1W9-SiNGS-19F4oGR9oQ_ws6Aa7QfzqEAlXdQDvUuD6sm1XY5fPYya4-YOjwPW51swwcmS_EYfhHGedGmtvOGK6Qob3jkMJyCKjuOBJykhZS25SvFphBGXlrkqBTvrW_pcNHMuIvQpebVvyM9HOHRJKTUPerH6tBQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA-xXHiL34XqKAHRFHxu7IOWfxTs68jNmvNkqnJoNbMycs9VMK057jSS6tIxsjMkXRHADOydgpwKJUXjY29fLTt3zZA-URmgSGYVJwKuzZYUKeW1_MfGHx-IV18QGwyY9QaieBx9ELlGBOeFn-MtmdBTMEpzIuUNuHp5MHdEtWMOFkyck4jXddXBc4x-x9r72-zspKgaKbH_xMvu-YD5KSsNBk45AfwD1a_D6a6oJLURHUsfhMh2RseOzO-J3zIbezLGiAFAgezOt4"
];
const HERO_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDaGFbFu-xIjuqWk-MKgTNQHEAQFJyG0jh44tuYJVmALeQ9INgpKnLewqou4kLvAnbGki4NYO5NmS5Sq_tgD9u8sQXoGSf6sc6_Xp6vjn8SLGuyENM2zrNLYy1CMIJ6EwLjQ6vzRTvZU4SReW5ksuVzajf71lk1H9beRnCBjPLvGO2DeSUUnQIXn5HUdNMS5oNLubULhrHRLpauyDXSgxrAi_jBZrGdhvdqsF9o-iAcvNW07BJ5gRDgXV9Z-AxH3KmnlwNUya0Pde8";

export default function MyCoursesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (!user) return;
        api.get('/courses/my/enrollments').then((res) => {
            setEnrollments(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user, router]);

    const overallProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
        : 0;

    const activeEnrollment = enrollments.find(e => !e.completed) || enrollments[0];

    if (loading) return (
        <div className="flex items-center justify-center py-20 min-h-screen bg-background-light dark:bg-background-dark">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        </div>
    );

    return (
        <RoleGuard allowedRoles={['STUDENT']}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden"
            >
                <div className="flex h-screen overflow-hidden">
                    <StudentSidebar
                        isSidebarCollapsed={isSidebarCollapsed}
                        setIsSidebarCollapsed={setIsSidebarCollapsed}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <StudentHeader title="My Courses" subtitle="Track your learning progress and continue where you left off." />
                        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                                {/* Welcome Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h1 className="text-3xl font-black tracking-tight lg:text-4xl text-slate-900 dark:text-white">
                                            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                                        </h1>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            {enrollments.length > 0
                                                ? `You're making great progress. ${enrollments.filter(e => !e.completed).length} courses in progress!`
                                                : "Start your learning journey by enrolling in a course."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold uppercase text-slate-400">Overall Progress</span>
                                            <span className="text-xl font-bold text-primary">{overallProgress}%</span>
                                        </div>
                                        <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">analytics</span>
                                        </div>
                                    </div>
                                </div>

                                {enrollments.length === 0 ? (
                                    <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">menu_book</span>
                                        <p className="mt-4 text-lg font-medium text-slate-500">No courses yet</p>
                                        <p className="text-sm text-slate-400 mb-6">Start your learning journey by enrolling in a course.</p>
                                        <Link href="/courses" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition shadow-lg shadow-primary/25">
                                            Browse Courses
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {/* Continue Learning Hero + Stats */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {activeEnrollment && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="lg:col-span-2"
                                                >
                                                    <Link href={`/courses/${activeEnrollment.course.id}`} className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white min-h-[220px] flex flex-col justify-end group block">
                                                        <div className="absolute inset-0 opacity-40 bg-center bg-cover" style={{
                                                            backgroundImage: `url('${activeEnrollment.course.thumbnail
                                                                ? getFileUrl(activeEnrollment.course.thumbnail)
                                                                : HERO_BG
                                                                }')`
                                                        }}></div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                                                        <div className="relative z-10 flex flex-col gap-3">
                                                            <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-xs font-bold self-start border border-primary/30">CURRENTLY ACTIVE</span>
                                                            <h2 className="text-2xl font-bold">{activeEnrollment.course.title}</h2>
                                                            <p className="text-slate-300 text-sm max-w-md line-clamp-2">{activeEnrollment.course.description}</p>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2">
                                                                    Continue Learning <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                                </motion.span>
                                                                <span className="text-sm font-medium text-slate-300">{activeEnrollment.progress}% complete</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            )}

                                            {/* Weekly Activity Card */}
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col gap-6"
                                            >
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Weekly Activity</h3>
                                                <div className="flex items-end justify-between h-24 px-2">
                                                    {[40, 60, 30, 90, 70, 85, 45].map((h, i) => (
                                                        <div key={i} className={`w-4 rounded-t-full ${i >= 3 && i <= 5 ? 'bg-primary' : 'bg-primary/20'}`} style={{ height: `${h}%` }}></div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-500">Learning Streak</span>
                                                        <span className="text-lg font-bold text-slate-900 dark:text-white">12 Days</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-orange-500 text-3xl">local_fire_department</span>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Active Courses Grid */}
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Active Courses</h2>
                                                <Link href="/courses" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                                                    View All <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                </Link>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {enrollments.map((enrollment, idx) => (
                                                    <motion.div
                                                        key={enrollment.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: idx * 0.1 }}
                                                    >
                                                        <Link
                                                            href={`/courses/${enrollment.course.id}`}
                                                            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-sm hover:shadow-md transition-shadow block h-full"
                                                        >
                                                            <div className="relative h-40 overflow-hidden">
                                                                <div
                                                                    className="absolute inset-0 bg-center bg-cover group-hover:scale-105 transition-transform duration-500"
                                                                    style={{
                                                                        backgroundImage: `url('${enrollment.course.thumbnail
                                                                            ? getFileUrl(enrollment.course.thumbnail)
                                                                            : COURSE_IMAGES[idx % COURSE_IMAGES.length]
                                                                            }')`
                                                                    }}
                                                                ></div>
                                                                <div className="absolute top-4 left-4">
                                                                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                                                                        {enrollment.course.tags?.[0] || enrollment.course.category || 'COURSE'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="p-5 flex flex-col gap-4">
                                                                <div>
                                                                    <h3 className="font-bold text-lg leading-tight mb-1 text-slate-900 dark:text-white">{enrollment.course.title}</h3>
                                                                    <p className="text-xs text-slate-500">{enrollment.course.instructor?.name ? `Instructor: ${enrollment.course.instructor.name}` : ''}</p>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex justify-between text-xs font-bold">
                                                                        <span className="text-slate-400">PROGRESS</span>
                                                                        <span className="text-primary">{enrollment.progress}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${enrollment.progress}%` }}></div>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                                                                        <span>{enrollment.course._count?.modules || 0} Modules</span>
                                                                        {enrollment.completed ? (
                                                                            <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                                                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Completed
                                                                            </span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1">
                                                                                <span className="material-symbols-outlined text-[14px]">timer</span> In Progress
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Recently Earned Certificates */}
                                        {enrollments.some(e => e.completed) && (
                                            <div className="flex flex-col gap-6">
                                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Recently Earned Certificates</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {enrollments.filter(e => e.completed).map((enrollment) => (
                                                        <div key={enrollment.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                                            <div className="flex items-center gap-4">
                                                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                                    <span className="material-symbols-outlined text-2xl">verified</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-900 dark:text-white">{enrollment.course.title}</span>
                                                                    <span className="text-xs text-slate-500">Completed</span>
                                                                </div>
                                                            </div>
                                                            <Link href="/certificates" className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors">
                                                                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                                                View
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </main>
                    </div>
                </div>
            </motion.div>
        </RoleGuard>
    );
}
