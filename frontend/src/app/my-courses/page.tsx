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
import { useSectionContainerVariants, useSectionItemVariants, useCardHoverMotion, useButtonHoverMotion, imageInViewVariants, viewportOnce } from '@/lib/motion';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [weeklyActivity, setWeeklyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [streak, setStreak] = useState(0);
    const sectionContainer = useSectionContainerVariants();
    const sectionItem = useSectionItemVariants();
    const cardHover = useCardHoverMotion();
    const buttonHover = useButtonHoverMotion();

    useEffect(() => {
        if (!user) return;
        api.get('/courses/my/enrollments').then((res) => {
            setEnrollments(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
        api.get('/courses/my/activity').then((res) => {
            setWeeklyActivity(res.data.weeklyActivity);
            setStreak(res.data.streak);
        }).catch(() => {});
    }, [user, router]);

    const overallProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
        : 0;

    const activeEnrollment = enrollments.find(e => !e.completed) || enrollments[0];
    const completedCount = enrollments.filter(e => e.completed).length;
    const inProgressCount = enrollments.filter(e => !e.completed).length;

    if (loading) return (
        <div className="flex items-center justify-center py-20 min-h-screen bg-background-light dark:bg-background-dark">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                    <div className="absolute inset-0 h-10 w-10 rounded-full bg-primary/20 blur-lg animate-pulse"></div>
                </div>
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading your courses...</p>
            </motion.div>
        </div>
    );

    return (
        <RoleGuard allowedRoles={['STUDENT']}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased transition-colors duration-200 relative"
            >
                <StudentSidebar
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
                    <StudentHeader
                        title="My Courses"
                        subtitle="Track progress and continue learning"
                        icon="school"
                        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
                    />

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
                        <div className="max-w-6xl mx-auto flex flex-col gap-8">

                            {/* Stats Row */}
                            <motion.div
                                variants={sectionContainer}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                {[
                                    { label: 'Enrolled', value: enrollments.length, icon: 'menu_book', color: 'text-primary', bg: 'bg-primary/10' },
                                    { label: 'In Progress', value: inProgressCount, icon: 'pending', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { label: 'Completed', value: completedCount, icon: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Progress', value: `${overallProgress}%`, icon: 'analytics', color: 'text-violet-500', bg: 'bg-violet-500/10' },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        variants={sectionItem}
                                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                                <span className={`material-symbols-outlined text-xl ${stat.color}`}>{stat.icon}</span>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {enrollments.length === 0 ? (
                                <motion.div
                                    variants={sectionItem}
                                    initial="hidden"
                                    animate="show"
                                    className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-primary">menu_book</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No courses yet</p>
                                    <p className="text-sm text-slate-400 mb-6">Start your learning journey by enrolling in a course.</p>
                                    <motion.span whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <Link href="/courses" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition shadow-[0_8px_25px_rgba(13,185,242,0.35)]">
                                            <span className="material-symbols-outlined text-sm">explore</span>
                                            Browse Courses
                                        </Link>
                                    </motion.span>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Continue Learning Hero */}
                                    {activeEnrollment && (
                                        <motion.div
                                            variants={sectionContainer}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={viewportOnce}
                                            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
                                        >
                                            <motion.div variants={sectionItem} className="lg:col-span-2">
                                                <motion.div
                                                    initial="hidden"
                                                    whileInView="show"
                                                    viewport={viewportOnce}
                                                    variants={imageInViewVariants}
                                                    className="h-full"
                                                >
                                                    <Link href={`/courses/${activeEnrollment.course.id}`} className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white min-h-[220px] flex flex-col justify-end group block shadow-[0_8px_30px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-0.5 border border-white/5">
                                                        <div className="absolute inset-0 opacity-40 bg-center bg-cover group-hover:scale-105 transition-transform duration-700" style={{
                                                            backgroundImage: `url('${activeEnrollment.course.thumbnail
                                                                ? getFileUrl(activeEnrollment.course.thumbnail)
                                                                : HERO_BG
                                                            }')`
                                                        }}></div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
                                                        <div className="relative z-10 flex flex-col gap-3">
                                                            <span className="bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider self-start border border-primary/30">Currently Active</span>
                                                            <h2 className="text-2xl font-bold tracking-tight">{activeEnrollment.course.title}</h2>
                                                            <p className="text-slate-300 text-sm max-w-md line-clamp-2">{activeEnrollment.course.description}</p>
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }} className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 w-fit text-sm shadow-[0_8px_25px_rgba(13,185,242,0.35)] transition-all">
                                                                    Continue Learning <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                                </motion.span>
                                                                <span className="text-sm font-medium text-slate-300">{activeEnrollment.progress}% complete</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            </motion.div>

                                            {/* Weekly Activity Card */}
                                            <motion.div
                                                variants={sectionItem}
                                                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-300"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Weekly Activity</h3>
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between h-24 px-1">
                                                    {weeklyActivity.map((h, i) => (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ height: 0 }}
                                                            whileInView={{ height: `${h}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.8, 0.25, 1] }}
                                                            className={`w-5 rounded-lg ${h > 0 ? 'bg-gradient-to-t from-primary to-cyan-400 shadow-[0_0_8px_rgba(13,185,242,0.3)]' : 'bg-primary/15'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase px-1">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] text-slate-400 font-medium">Learning Streak</span>
                                                        <span className="text-lg font-bold text-slate-900 dark:text-white">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-orange-500 text-2xl">local_fire_department</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}

                                    {/* Active Courses Grid */}
                                    <motion.div
                                        variants={sectionContainer}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={viewportOnce}
                                        className="flex flex-col gap-5"
                                    >
                                        <motion.div variants={sectionItem} className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">All Courses</h2>
                                            <motion.span whileHover={{ x: 2 }}>
                                                <Link href="/courses" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                                    Browse More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </Link>
                                            </motion.span>
                                        </motion.div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {enrollments.map((enrollment, idx) => (
                                                <motion.div
                                                    key={enrollment.id}
                                                    variants={sectionItem}
                                                    whileHover={{ y: -4 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Link
                                                        href={`/courses/${enrollment.course.id}`}
                                                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 group shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_35px_rgba(15,23,42,0.12)] transition-all duration-300 block h-full"
                                                    >
                                                        <div className="relative h-40 overflow-hidden">
                                                            <motion.div
                                                                initial="hidden"
                                                                whileInView="show"
                                                                viewport={viewportOnce}
                                                                variants={imageInViewVariants}
                                                                className="absolute inset-0 bg-center bg-cover group-hover:scale-110 transition-transform duration-700"
                                                                style={{
                                                                    backgroundImage: `url('${enrollment.course.thumbnail
                                                                        ? getFileUrl(enrollment.course.thumbnail)
                                                                        : COURSE_IMAGES[idx % COURSE_IMAGES.length]
                                                                    }')`
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            <div className="absolute top-3 left-3">
                                                                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
                                                                    {enrollment.course.tags?.[0] || enrollment.course.category || 'COURSE'}
                                                                </span>
                                                            </div>
                                                            {enrollment.completed && (
                                                                <div className="absolute top-3 right-3">
                                                                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[12px]">check_circle</span> Done
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-5 flex flex-col gap-4">
                                                            <div>
                                                                <h3 className="font-bold text-base leading-tight mb-1 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{enrollment.course.title}</h3>
                                                                <p className="text-[11px] text-slate-400 font-medium">{enrollment.course.instructor?.name ? `By ${enrollment.course.instructor.name}` : ''}</p>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                                                    <span className="text-slate-400">Progress</span>
                                                                    <span className="text-primary">{enrollment.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        whileInView={{ width: `${enrollment.progress}%` }}
                                                                        viewport={{ once: true }}
                                                                        transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                                                                        className={`h-full rounded-full ${enrollment.progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-primary to-cyan-400'} progress-bar-glow`}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-0.5">
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[13px]">folder</span>
                                                                        {enrollment.course._count?.modules || 0} Modules
                                                                    </span>
                                                                    {enrollment.completed ? (
                                                                        <span className="flex items-center gap-1 text-emerald-500 font-bold">
                                                                            <span className="material-symbols-outlined text-[13px]">verified</span> Completed
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-amber-500 font-medium">
                                                                            <span className="material-symbols-outlined text-[13px]">timer</span> In Progress
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Recently Earned Certificates */}
                                    {enrollments.some(e => e.completed) && (
                                        <motion.div
                                            variants={sectionContainer}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={viewportOnce}
                                            className="flex flex-col gap-5"
                                        >
                                            <motion.div variants={sectionItem} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-emerald-500 text-lg">workspace_premium</span>
                                                </div>
                                                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Earned Certificates</h2>
                                            </motion.div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {enrollments.filter(e => e.completed).map((enrollment) => (
                                                    <motion.div
                                                        key={enrollment.id}
                                                        variants={sectionItem}
                                                        whileHover={{ y: -2 }}
                                                        className="flex items-center justify-between p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-300"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-emerald-500 text-2xl drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]">verified</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm text-slate-900 dark:text-white">{enrollment.course.title}</span>
                                                                <span className="text-[11px] text-slate-400 font-medium">Course Completed</span>
                                                            </div>
                                                        </div>
                                                        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                            <Link href="/certificates" className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 px-3.5 py-2 rounded-xl hover:bg-primary/20 transition-all">
                                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                                View
                                                            </Link>
                                                        </motion.span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </motion.div>
        </RoleGuard>
    );
}
