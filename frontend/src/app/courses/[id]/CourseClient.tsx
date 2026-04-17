'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatPrice } from '@/lib/utils';
import { CourseDetail, Module, Lesson } from '@/lib/types';
import Link from 'next/link';
import { getFileUrl } from '@/lib/url-utils';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

export default function CourseDetailPage() {
    const { id } = useParams();
    const { user, activeRole } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromQuiz = searchParams.get('fromQuiz');
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [progress, setProgress] = useState(0);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [materialIndex, setMaterialIndex] = useState(0);
    const [paymentBanner, setPaymentBanner] = useState<'success' | 'cancelled' | null>(null);
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    useEffect(() => {
        api.get(`/courses/${id}`).then((r) => {
            const data = r.data as CourseDetail;
            if (data.modules) {
                // Filter out lessons with no material, and then filter out empty modules
                data.modules = data.modules.map(mod => ({
                    ...mod,
                    lessons: mod.lessons?.filter(l => l.videoUrl || l.materialUrl) || []
                })).filter(mod => mod.lessons.length > 0 || (mod.quizzes && mod.quizzes.length > 0));
            }
            setCourse(data);

            if (fromQuiz) {
                let foundQuiz = false;
                for (let i = 0; i < (data.modules?.length || 0); i++) {
                    const mod = data.modules[i];
                    if (mod.quizzes?.some(q => q.id === fromQuiz)) {
                        foundQuiz = true;
                        if (i + 1 < data.modules.length) {
                            const nextMod = data.modules[i + 1];
                            setExpandedModules(new Set([nextMod.id]));
                            if (nextMod.lessons?.length > 0) {
                                setActiveLesson(nextMod.lessons[0].id);
                            }
                        } else if (data.quizzes?.length > 0) {
                            router.push(`/quiz/${data.quizzes[0].id}`);
                        }
                        break;
                    }
                }
                if (foundQuiz) return;
            }
        });
    }, [id, fromQuiz]);

    useEffect(() => {
        if (user && course) {
            api.get('/courses/my/enrollments').then((r) => {
                const found = r.data.find((e: any) => e.courseId === course.id);
                const isInstructor = course.instructor && course.instructor.id === user.id;
                const isAdmin = activeRole === 'ADMIN';
                
                // Instructors get access if it's their course.
                // Admins get access ONLY if the course has no instructor assigned.
                const hasOverrideAccess = isInstructor || (isAdmin && !course.instructor);

                if (found || hasOverrideAccess) {
                    setEnrolled(true);
                    const currentProgress = found ? (found.progress || 0) : 0;
                    setProgress(currentProgress);

                    // If enrolled, calculate which lesson should be active based on progress
                    const allLessons: Lesson[] = course.modules?.flatMap(m => m.lessons) || [];
                    const totalLessons = allLessons.length;
                    if (totalLessons > 0) {
                        if (currentProgress === 0) {
                            // Reset to first
                            setActiveLesson(allLessons[0].id);
                            if (course.modules?.[0]) {
                                setExpandedModules(new Set([course.modules[0].id]));
                            }
                        } else if (currentProgress >= 100) {
                            // Fully completed, stay on the last lesson or whatever they clicked
                            if (!activeLesson) {
                                setActiveLesson(allLessons[totalLessons - 1].id);
                                const mod = findModuleForLesson(allLessons[totalLessons - 1].id);
                                if (mod) setExpandedModules(new Set([mod.id]));
                            }
                        } else {
                            // Calculate current lesson index based on progress percentage
                            const currentIndex = Math.max(0, Math.floor((currentProgress / 100) * totalLessons));
                            const safeIndex = Math.min(currentIndex, totalLessons - 1);

                            if (!activeLesson) {
                                setActiveLesson(allLessons[safeIndex].id);
                                const mod = course.modules?.find(m => m.lessons.some(l => l.id === allLessons[safeIndex].id));
                                if (mod) setExpandedModules(new Set([mod.id]));
                            }
                        }
                    }
                } else {
                    // Not enrolled, just show the first module for preview
                    if (course.modules?.length > 0 && !fromQuiz && !activeLesson) {
                        const firstMod = course.modules[0];
                        setExpandedModules(new Set([firstMod.id]));
                        if (firstMod.lessons?.length > 0) {
                            setActiveLesson(firstMod.lessons[0].id);
                        }
                    }
                }
            }).catch(() => { });
        } else if (!user && course) {
            // Not logged in, just show the first module for preview
            if (course.modules?.length > 0 && !fromQuiz && !activeLesson) {
                const firstMod = course.modules[0];
                setExpandedModules(new Set([firstMod.id]));
                if (firstMod.lessons?.length > 0) {
                    setActiveLesson(firstMod.lessons[0].id);
                }
            }
        }
    }, [user, course, fromQuiz]);

    // Handle Stripe payment redirect
    useEffect(() => {
        if (paymentStatus === 'cancelled') {
            setPaymentBanner('cancelled');
        }
        if (paymentStatus === 'success' && sessionId && user && !enrolled) {
            setVerifyingPayment(true);
            setPaymentBanner('success');
            const verify = async () => {
                try {
                    const res = await api.get(`/payments/verify?session_id=${sessionId}`);
                    if (res.data.enrolled) {
                        setEnrolled(true);
                        setVerifyingPayment(false);
                    } else {
                        // Payment might still be processing, retry after a short delay
                        setTimeout(async () => {
                            try {
                                const retry = await api.get(`/payments/verify?session_id=${sessionId}`);
                                if (retry.data.enrolled) setEnrolled(true);
                            } catch { }
                            setVerifyingPayment(false);
                        }, 3000);
                    }
                } catch {
                    setVerifyingPayment(false);
                }
            };
            verify();
        }
    }, [paymentStatus, sessionId, user]);

    const handleEnroll = async () => {
        if (!user) return router.push('/login');
        setEnrolling(true);
        try {
            // Check if course is paid
            if (course?.price && course.price > 0) {
                // Redirect to Stripe Checkout
                const res = await api.post('/payments/create-checkout-session', { courseId: id });
                if (res.data.enrolled) {
                    // Already paid — enrollment was created on the spot
                    setEnrolled(true);
                    setEnrolling(false);
                    return;
                }
                if (res.data.sessionUrl) {
                    window.location.href = res.data.sessionUrl;
                    return; // Don't setEnrolling(false) — page is navigating away
                }
            } else {
                // Free course — instant enrollment
                await api.post(`/courses/${id}/enroll`);
                setEnrolled(true);
            }
        } catch (err: any) {
            // If backend returns 402, redirect to payment
            if (err?.response?.status === 402 && err?.response?.data?.requiresPayment) {
                try {
                    const res = await api.post('/payments/create-checkout-session', { courseId: id });
                    if (res.data.sessionUrl) {
                        window.location.href = res.data.sessionUrl;
                        return;
                    }
                } catch { }
            }
        }
        setEnrolling(false);
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });
    };

    const allLessons: Lesson[] = course?.modules?.flatMap(m => m.lessons) || [];
    const currentLessonIndex = allLessons.findIndex(l => l.id === activeLesson);
    const currentLesson = currentLessonIndex >= 0 ? allLessons[currentLessonIndex] : null;

    const findModuleForLesson = (lessonId: string): Module | undefined => {
        return course?.modules?.find(m => m.lessons.some(l => l.id === lessonId));
    };

    const totalLessons = allLessons.length;

    // Build sequential materials list for current lesson: respect videoFirst ordering
    const currentMaterials: { type: 'pdf' | 'video'; url: string }[] = [];
    if (currentLesson) {
        const videoMaterial = currentLesson.videoUrl ? { type: 'video' as const, url: currentLesson.videoUrl } : null;
        const pdfMaterials = (currentLesson.materialUrl || '').split(',').filter(Boolean).map(u => ({ type: 'pdf' as const, url: u.trim() })).filter(m => m.url);
        
        if ((currentLesson as any).videoFirst && videoMaterial) {
            currentMaterials.push(videoMaterial);
        }
        
        currentMaterials.push(...pdfMaterials);
        
        if (!(currentLesson as any).videoFirst && videoMaterial) {
            currentMaterials.push(videoMaterial);
        }
    }

    // Reset material index when lesson changes
    useEffect(() => {
        setMaterialIndex(0);
    }, [activeLesson]);

    // Navigate to next material within lesson, or next lesson
    const handleNext = async () => {
        if (!course || currentLessonIndex < 0) return;

        // If there are more materials within this lesson, go to the next one
        if (materialIndex < currentMaterials.length - 1) {
            setMaterialIndex(materialIndex + 1);
            return;
        }

        // All materials in this lesson viewed — advance to next lesson
        const newProgress = Math.min(
            Math.round(((currentLessonIndex + 1) / totalLessons) * 100),
            99
        );

        if (newProgress !== progress) {
            setProgress(newProgress);
            api.put(`/courses/${course.id}/progress`, { progress: newProgress }).catch(() => { });
        }

        const currentMod = findModuleForLesson(allLessons[currentLessonIndex].id);
        const moduleLessons = currentMod?.lessons || [];
        const isLastInModule = currentLessonIndex >= 0 && allLessons[currentLessonIndex].id === moduleLessons[moduleLessons.length - 1]?.id;

        if (isLastInModule && currentMod && currentMod.quizzes && currentMod.quizzes.length > 0) {
            router.push(`/quiz/${currentMod.quizzes[0].id}`);
        } else if (currentLessonIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentLessonIndex + 1];
            setActiveLesson(nextLesson.id);
            const mod = findModuleForLesson(nextLesson.id);
            if (mod) setExpandedModules(prev => new Set([...prev, mod.id]));
        } else if (course.quizzes?.length > 0) {
            router.push(`/quiz/${course.quizzes[0].id}`);
        } else {
            setCompleting(true);
            try {
                await api.put(`/courses/${course.id}/progress`, { progress: 100 });
                setProgress(100);
                setCompleting(false);
            } catch { setCompleting(false); }
        }
    };

    // Navigate to previous material within lesson, or previous lesson
    const handleBack = () => {
        if (materialIndex > 0) {
            setMaterialIndex(materialIndex - 1);
            return;
        }
        // Go to previous lesson (last material)
        if (currentLessonIndex > 0) {
            const prev = allLessons[currentLessonIndex - 1];
            setActiveLesson(prev.id);
            const mod = findModuleForLesson(prev.id);
            if (mod) setExpandedModules(p => new Set([...p, mod.id]));
            // materialIndex will reset to 0 via useEffect, but we want the last material of the prev lesson
            // We'll set a special flag — actually, since we can't know prev lesson's material count
            // until it renders, we'll just go to the start of the previous lesson (index 0).
        }
    };

    const isFirstMaterialOverall = currentLessonIndex <= 0 && materialIndex <= 0;
    const isLastMaterialInLesson = materialIndex >= currentMaterials.length - 1;
    const isLastLessonOverall = currentLessonIndex >= allLessons.length - 1;

    const getNextLabel = () => {
        if (!isLastMaterialInLesson) return 'Next Material »';
        if (!isLastLessonOverall) return 'Next Lesson »';
        if (course?.quizzes?.length && course.quizzes.length > 0) return 'Take Meta Quiz »';
        return 'Finish Course »';
    };

    if (!course) return (
        <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        </div>
    );


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen w-full bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans overflow-hidden"
        >
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-70" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] opacity-50" />
            </div>

            {/* Left Sidebar (Navigation Rail) */}
            {enrolled && user && (
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarExpanded ? 320 : 80 }}
                    onMouseEnter={() => setIsSidebarExpanded(true)}
                    onMouseLeave={() => setIsSidebarExpanded(false)}
                className="z-40 h-screen shrink-0 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-all overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-black/40"
            >
                {/* Progress Mini/Expanded */}
                <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center min-h-[85px]">
                    <AnimatePresence mode="wait">
                        {isSidebarExpanded ? (
                            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Progress</span>
                                    <span className="text-primary font-bold text-sm">{progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="collapsed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                                <div className="relative w-10 h-10 flex flex-col items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 text-xs font-bold text-primary">
                                    {progress}%
                                    <svg className="absolute -inset-0.5 w-[44px] h-[44px] -rotate-90">
                                        <circle cx="22" cy="22" r="20" className="stroke-primary" strokeWidth="2" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * progress) / 100} strokeLinecap="round" />
                                    </svg>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 pt-4 pb-24">
                    {course.modules?.map((mod, mi) => (
                        <div key={mod.id} className="mb-2 px-3">
                            {isSidebarExpanded ? (
                                <button onClick={() => toggleModule(mod.id)} className="w-full px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left flex items-center justify-between hover:text-primary transition-colors">
                                    <span className="truncate">Module {mi + 1}: {mod.title}</span>
                                    <span className="material-symbols-outlined text-sm">{expandedModules.has(mod.id) ? 'expand_less' : 'expand_more'}</span>
                                </button>
                            ) : (
                                <div className="w-full h-10 flex items-center justify-center mb-1 text-slate-400 group relative cursor-pointer" onClick={() => {setIsSidebarExpanded(true); toggleModule(mod.id);}}>
                                    <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">folder</span>
                                </div>
                            )}

                            {(expandedModules.has(mod.id) || !isSidebarExpanded) && isSidebarExpanded && (
                                <div className="space-y-1 mt-1">
                                    {mod.lessons?.map((lesson) => {
                                        const isActive = activeLesson === lesson.id;
                                        const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                                        const maxCompletedIdx = progress >= 100 ? totalLessons : Math.floor((progress / 100) * totalLessons);
                                        const isCompleted = globalIdx < maxCompletedIdx;

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative overflow-hidden group ${isActive ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white font-medium border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                                >
                                                    {isActive && <motion.div layoutId="activeLesson" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                                    <span className={`material-symbols-outlined text-lg ${isCompleted ? 'text-emerald-500' : isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'text-slate-400'}`}>
                                                        {isCompleted ? 'check_circle' : isActive ? 'play_circle' : 'radio_button_unchecked'}
                                                    </span>
                                                    <span className="truncate whitespace-nowrap text-left flex-1">{lesson.title}</span>
                                                    {lesson.materialUrl && lesson.materialUrl.toLowerCase().endsWith('.pdf') && (
                                                        <span className={`material-symbols-outlined text-[14px] shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400/60'}`} title="PDF Material">picture_as_pdf</span>
                                                    )}
                                                    {lesson.videoUrl && (
                                                        <span className={`material-symbols-outlined text-[14px] shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400/60'}`} title="Video Lesson">videocam</span>
                                                    )}
                                                </button>
                                            );
                                    })}
                                    {mod.quizzes?.map((quiz) => (
                                        <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 transition-all">
                                            <span className="material-symbols-outlined text-lg text-emerald-500">quiz</span>
                                            <span className="truncate whitespace-nowrap text-left">{quiz.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {course.quizzes?.length > 0 && isSidebarExpanded && (
                        <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 px-3">
                            <p className="px-3 py-2 text-[11px] font-bold text-primary uppercase tracking-widest opacity-80">Final Exam</p>
                            {course.quizzes.map((quiz) => (
                                <Link key={quiz.id} href={`/quiz/${quiz.id}`} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all">
                                    <span className="material-symbols-outlined text-lg text-primary">workspace_premium</span>
                                    <span className="truncate font-medium">{quiz.title}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                </motion.aside>
            )}

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 h-screen overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeLesson || 'enrollment'}
                        initial={{ opacity: 0, scale: 0.98, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -15 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full flex flex-col"
                    >
                        {verifyingPayment ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="max-w-xl text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                                    <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                                    <h2 className="text-2xl font-bold tracking-tight mb-2">Confirming your payment...</h2>
                                    <p className="text-slate-500 dark:text-slate-400">Please wait while we verify your payment and activate your enrollment.</p>
                                </div>
                            </div>
                        ) : !enrolled && user ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="max-w-xl text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                                    {paymentBanner === 'cancelled' && (
                                        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">info</span>
                                                Payment was cancelled. You can try again.
                                            </span>
                                            <button onClick={() => setPaymentBanner(null)} className="text-amber-500 hover:text-amber-700 transition-colors">
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    )}
                                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 rotate-3">
                                        <span className="material-symbols-outlined text-primary text-5xl -rotate-3">play_arrow</span>
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight mb-4">{course.title}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed max-w-md mx-auto">{course.description}</p>
                                    {course.price && course.price > 0 && (
                                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-6">${formatPrice(course.price)}</p>
                                    )}
                                    <button onClick={handleEnroll} disabled={enrolling} className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-sky-500 px-8 text-lg font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:hover:scale-100">
                                        {enrolling
                                            ? (course.price && course.price > 0 ? 'Redirecting to payment...' : 'Enrolling...')
                                            : (course.price && course.price > 0 ? `Pay $${formatPrice(course.price)} & Enroll` : 'Start Learning Now')
                                        }
                                    </button>
                                </div>
                            </div>
                        ) : !user ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="max-w-xl text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                                    <h2 className="text-3xl font-bold tracking-tight mb-4">{course.title}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">{course.description}</p>
                                    <Link href="/login" className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 px-8 text-lg font-bold text-white dark:text-slate-900 transition-all hover:scale-[1.02] shadow-xl">
                                        Sign in to Enroll
                                    </Link>
                                </div>
                            </div>
                        ) : currentLesson && currentMaterials.length > 0 ? (
                            <div className="w-full h-full flex flex-col">
                                {/* Material Viewer — sequential: PDFs first, then video */}
                                {(() => {
                                    const mat = currentMaterials[materialIndex];
                                    if (!mat) return null;

                                    if (mat.type === 'video') {
                                        return (
                                            <div className="flex flex-col h-full w-full bg-black overflow-hidden">
                                                {/* ─── Top Toolbar ─── */}
                                                <div className="flex items-center justify-between h-[42px] min-h-[42px] bg-[#323639] text-white text-sm px-4 select-none shrink-0 border-b border-white/10 shadow-sm z-10 relative">
                                                    <div className="flex items-center gap-2 min-w-0 flex-shrink overflow-hidden">
                                                        <span className="truncate text-[13px] text-gray-200 font-medium max-w-[280px]">{currentLesson.title}</span>
                                                        {currentMaterials.length > 1 && (
                                                            <span className="text-[11px] text-gray-400 ml-2">({materialIndex + 1}/{currentMaterials.length})</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => router.push('/my-courses')}
                                                            className="px-3 h-7 rounded hover:bg-white/10 transition-colors text-[13px] text-gray-200 font-medium"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ─── Video Area ─── */}
                                                <div className="flex-1 overflow-auto flex justify-center items-center bg-black p-4 md:p-8">
                                                    <div className="w-full h-full max-w-[1200px] flex justify-center items-center">
                                                        <video key={`${currentLesson.id}-${materialIndex}`} controls className="max-h-full max-w-full rounded-xl shadow-2xl ring-1 ring-white/10" src={getFileUrl(mat.url)} />
                                                    </div>
                                                </div>

                                                {/* ─── Bottom Navigation Bar ─── */}
                                                <div className="flex items-center justify-between h-[40px] min-h-[40px] bg-[#f0f0f0] dark:bg-[#2a2d31] border-t border-gray-300 dark:border-gray-600 px-5 shrink-0 z-10 relative">
                                                    {!isFirstMaterialOverall ? (
                                                        <button
                                                            onClick={handleBack}
                                                            className="text-[13px] text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors"
                                                        >
                                                            « Back
                                                        </button>
                                                    ) : (
                                                        <div />
                                                    )}
                                                    <button
                                                        onClick={handleNext}
                                                        className="text-[13px] text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium transition-colors"
                                                    >
                                                        {getNextLabel()}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }

                                    // PDF material
                                    return (
                                        <PdfViewer
                                            key={`${currentLesson.id}-${materialIndex}`}
                                            url={getFileUrl(mat.url)}
                                            filename={mat.url.split('/').pop() || `${currentLesson.title} - PDF`}
                                            onClose={() => router.push('/my-courses')}
                                            onBack={!isFirstMaterialOverall ? handleBack : undefined}
                                            onNext={handleNext}
                                            backLabel="« Back"
                                            nextLabel={getNextLabel()}
                                        />
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">
                                Select a lesson from the sidebar to begin.
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </motion.div>
    );
}