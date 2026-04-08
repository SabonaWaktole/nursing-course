'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CourseDetail, Module, Lesson } from '@/lib/types';
import Link from 'next/link';
import { getFileUrl } from '@/lib/url-utils';
import { motion, AnimatePresence } from 'framer-motion';
import PdfViewer from '@/components/PdfViewer';

export default function CourseDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromQuiz = searchParams.get('fromQuiz');

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const [enrolled, setEnrolled] = useState(false);
    const [activeLesson, setActiveLesson] = useState<string | null>(null);
    const [completing, setCompleting] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [progress, setProgress] = useState(0);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    useEffect(() => {
        api.get(`/courses/${id}`).then((r) => {
            const data = r.data as CourseDetail;
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
                if (found) {
                    setEnrolled(true);
                    setProgress(found.progress || 0);

                    // If enrolled, calculate which lesson should be active based on progress
                    const allLessons: Lesson[] = course.modules?.flatMap(m => m.lessons) || [];
                    const totalLessons = allLessons.length;
                    if (totalLessons > 0) {
                        if (found.progress === 0) {
                            // Reset to first
                            setActiveLesson(allLessons[0].id);
                            if (course.modules?.[0]) {
                                setExpandedModules(new Set([course.modules[0].id]));
                            }
                        } else if (found.progress >= 100) {
                            // Fully completed, stay on the last lesson or whatever they clicked
                            if (!activeLesson) {
                                setActiveLesson(allLessons[totalLessons - 1].id);
                                const mod = findModuleForLesson(allLessons[totalLessons - 1].id);
                                if (mod) setExpandedModules(new Set([mod.id]));
                            }
                        } else {
                            // Calculate current lesson index based on progress percentage
                            const currentIndex = Math.max(0, Math.floor((found.progress / 100) * totalLessons));
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

    const handleEnroll = async () => {
        if (!user) return router.push('/login');
        setEnrolling(true);
        try {
            await api.post(`/courses/${id}/enroll`);
            setEnrolled(true);
        } catch { }
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

    const handleNext = async () => {
        if (!course || currentLessonIndex < 0) return;

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
                        {!enrolled && user ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="max-w-xl text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl p-12 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 rotate-3">
                                        <span className="material-symbols-outlined text-primary text-5xl -rotate-3">play_arrow</span>
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight mb-4">{course.title}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">{course.description}</p>
                                    <button onClick={handleEnroll} disabled={enrolling} className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-sky-500 px-8 text-lg font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:hover:scale-100">
                                        {enrolling ? 'Enrolling...' : 'Start Learning Now'}
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
                        ) : currentLesson ? (
                            <div className="w-full h-full flex flex-col">
                                {/* Material Viewer */}
                                {currentLesson.videoUrl ? (
                                    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-black ring-1 ring-slate-900/10 dark:ring-white/10 aspect-video">
                                        <video key={currentLesson.id} controls className="h-full w-full object-contain" src={getFileUrl(currentLesson.videoUrl)} />
                                    </div>
                                ) : currentLesson.materialUrl && currentLesson.materialUrl.toLowerCase().endsWith('.pdf') ? (
                                    <PdfViewer
                                        key={currentLesson.id}
                                        url={getFileUrl(currentLesson.materialUrl)}
                                        filename={currentLesson.materialUrl.split('/').pop() || currentLesson.title}
                                        onClose={() => router.push('/courses')}
                                        onBack={currentLessonIndex > 0 ? () => {
                                            const prev = allLessons[currentLessonIndex - 1];
                                            setActiveLesson(prev.id);
                                            const mod = findModuleForLesson(prev.id);
                                            if (mod) setExpandedModules(p => new Set([...p, mod.id]));
                                        } : undefined}
                                        onNext={handleNext}
                                        backLabel="« Back"
                                        nextLabel={currentLessonIndex < allLessons.length - 1 ? 'Next »' : course.quizzes?.length > 0 ? 'Take Meta Quiz »' : 'Finish Course »'}
                                    />
                                ) : null}
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