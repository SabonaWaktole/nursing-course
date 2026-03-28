'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CourseDetail, Module, Lesson } from '@/lib/types';
import Link from 'next/link';
import { getFileUrl } from '@/lib/url-utils';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = useCallback(() => {
        if (!pdfContainerRef.current) return;
        if (!document.fullscreenElement) {
            pdfContainerRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-b from-background-light via-white to-background-light dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950 text-slate-900 dark:text-slate-100"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 -left-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />
            </div>
            <div className="relative flex flex-1 flex-col lg:flex-row">
                {/* Left Sidebar: Course Navigation */}
                <motion.aside
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full lg:w-80 border-r border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/70 backdrop-blur-xl flex flex-col shrink-0"
                >
                    {/* Progress */}
                    <div className="p-6 border-b border-slate-100/70 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Progress</span>
                            <span className="text-primary font-bold text-sm">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    {/* Module/Lesson list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {course.modules?.map((mod, mi) => (
                            <div key={mod.id} className="mb-4">
                                <button
                                    onClick={() => toggleModule(mod.id)}
                                    className="w-full px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-left flex items-center justify-between hover:text-primary transition-colors"
                                >
                                    <span>Module {mi + 1}: {mod.title}</span>
                                    <span className="material-symbols-outlined text-sm">
                                        {expandedModules.has(mod.id) ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {expandedModules.has(mod.id) && (
                                    <>
                                        {mod.lessons?.map((lesson) => {
                                            const isActive = activeLesson === lesson.id;
                                            const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                                            // Tie completion to the actual database progress percentage rather than what they clicked
                                            const maxCompletedIdx = progress >= 100 ? totalLessons : Math.floor((progress / 100) * totalLessons);
                                            const isCompleted = globalIdx < maxCompletedIdx;
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                                                        ? 'bg-primary/10 text-primary font-semibold'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-lg ${isCompleted ? 'text-green-500' : isActive ? 'text-primary' : 'text-slate-300 dark:text-slate-600'
                                                        }`}>
                                                        {isCompleted ? 'check_circle' : isActive ? 'play_circle' : 'radio_button_unchecked'}
                                                    </span>
                                                    <span className="truncate">{lesson.title}</span>
                                                </button>
                                            );
                                        })}
                                        {/* Module quizzes */}
                                        {mod.quizzes?.map((quiz) => (
                                            <Link
                                                key={quiz.id}
                                                href={`/quiz/${quiz.id}`}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-lg text-emerald-500">quiz</span>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Module Quiz</span>
                                                    <span className="truncate">{quiz.title}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Final exam */}
                        {course.quizzes?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <p className="px-3 py-2 text-xs font-bold text-primary uppercase tracking-widest">Final Examination</p>
                                {course.quizzes.map((quiz) => (
                                    <Link
                                        key={quiz.id}
                                        href={`/quiz/${quiz.id}`}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg text-primary">workspace_premium</span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{quiz.title}</span>
                                            <span className="text-[10px] text-slate-500">{quiz._count?.questions || 0} Questions</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enroll button */}
                    {!enrolled && (
                        <div className="p-4 border-t border-slate-200/70 dark:border-slate-800/80">
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-[0_16px_40px_rgba(56,189,248,0.45)] disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                                <span>{enrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                            </button>
                        </div>
                    )}
                </motion.aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeLesson || 'enrollment'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {!enrolled && user ? (
                                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                                    <div className="max-w-md text-center">
                                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                                            <span className="material-symbols-outlined text-primary text-4xl">play_circle</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
                                        <p className="mt-3 text-slate-600 dark:text-slate-400">{course.description}</p>
                                        <p className="mt-2 text-sm text-slate-500">
                                            {course.modules?.length || 0} modules · {totalLessons} lessons · {course.quizzes?.length || 0} quizzes
                                        </p>
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-white transition hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50"
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll in this Course'}
                                        </button>
                                    </div>
                                </div>
                            ) : !user ? (
                                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                                    <div className="max-w-md text-center">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
                                        <p className="mt-3 text-slate-600 dark:text-slate-400">{course.description}</p>
                                        <Link
                                            href="/login"
                                            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-white transition hover:bg-primary/90 shadow-lg shadow-primary/25"
                                        >
                                            Sign in to Enroll
                                        </Link>
                                    </div>
                                </div>
                            ) : currentLesson ? (
                                <div className="max-w-5xl mx-auto p-6 md:p-10">
                                    {/* Breadcrumbs */}
                                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                                        <Link href="/courses" className="hover:text-primary transition-colors">All Courses</Link>
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-medium truncate">{currentLesson.title}</span>
                                    </nav>

                                    {/* Lesson Header */}
                                    <div className="mb-8">
                                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">{currentLesson.title}</h1>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-2xl">
                                            {course.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                            {currentLesson.videoUrl && (
                                                <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-lg text-primary">video_library</span>
                                                    <span>Video Lesson</span>
                                                </div>
                                            )}
                                            {currentLesson.materialUrl && (
                                                <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-lg text-primary">assignment</span>
                                                    <span>Materials</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                                                <span>{findModuleForLesson(currentLesson.id)?.title || 'Module'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video/PDF Player */}
                                    {currentLesson.videoUrl ? (
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black group mb-10 border border-slate-900/60">
                                            <video
                                                key={currentLesson.id}
                                                controls
                                                className="h-full w-full object-contain"
                                                src={getFileUrl(currentLesson.videoUrl)}
                                            />
                                        </div>
                                    ) : currentLesson.materialUrl && currentLesson.materialUrl.toLowerCase().endsWith('.pdf') ? (
                                        <div
                                            ref={pdfContainerRef}
                                            className={`relative w-full rounded-2xl overflow-hidden shadow-2xl mb-10 transition-all duration-300 ${
                                                isFullscreen
                                                    ? 'rounded-none bg-black'
                                                    : 'bg-slate-200 dark:bg-slate-900'
                                            }`}
                                            style={isFullscreen ? { width: '100vw', height: '100vh' } : { height: '75vh' }}
                                        >
                                            {/* PDF Toolbar */}
                                            <div className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2.5 bg-slate-900/80 backdrop-blur-md border-b border-white/10 ${
                                                isFullscreen ? 'rounded-none' : 'rounded-t-2xl'
                                            }`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg text-red-400">picture_as_pdf</span>
                                                    <span className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-md">{currentLesson.title}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={getFileUrl(currentLesson.materialUrl)}
                                                        download
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                                        title="Download PDF"
                                                    >
                                                        <span className="material-symbols-outlined text-base">download</span>
                                                        <span className="hidden sm:inline">Download</span>
                                                    </a>
                                                    <a
                                                        href={getFileUrl(currentLesson.materialUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                                        title="Open in New Tab"
                                                    >
                                                        <span className="material-symbols-outlined text-base">open_in_new</span>
                                                        <span className="hidden sm:inline">New Tab</span>
                                                    </a>
                                                    <button
                                                        onClick={toggleFullscreen}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                                                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                                        </span>
                                                        <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* PDF iframe */}
                                            <iframe
                                                key={currentLesson.id}
                                                src={getFileUrl(currentLesson.materialUrl)}
                                                className="w-full border-none"
                                                style={{ height: 'calc(100% - 44px)', marginTop: '44px' }}
                                                title={currentLesson.title}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center bg-slate-900 rounded-2xl aspect-video mb-10 border border-slate-800/80" style={{ maxHeight: '40vh' }}>
                                            <div className="text-center text-white">
                                                <span className="material-symbols-outlined text-5xl opacity-50">description</span>
                                                <p className="mt-3 text-lg font-medium">Text-based Lesson</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lesson Content */}
                                    <article className="mb-10">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Lesson Summary</h2>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                            {currentLesson.description || "Complete this lesson to advance to the next module."}
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                                            {/* Materials download card */}
                                            {currentLesson.materialUrl && (
                                                <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary">file_present</span>
                                                        Course Materials
                                                    </h3>
                                                    <a
                                                        href={getFileUrl(currentLesson.materialUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                        Download Materials
                                                    </a>
                                                </div>
                                            )}
                                            {/* Best practice tip */}
                                            <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary">lightbulb</span>
                                                    Best Practice Tip
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    Review each lesson thoroughly before moving to the next. Take notes on key concepts for the module quiz.
                                                </p>
                                            </div>
                                        </div>
                                    </article>

                                    {/* Navigation */}
                                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                                        {currentLessonIndex > 0 ? (
                                            <button
                                                onClick={() => {
                                                    const prev = allLessons[currentLessonIndex - 1];
                                                    setActiveLesson(prev.id);
                                                    const mod = findModuleForLesson(prev.id);
                                                    if (mod) setExpandedModules(p => new Set([...p, mod.id]));
                                                }}
                                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition"
                                            >
                                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                                Previous Lesson
                                            </button>
                                        ) : <div />}
                                        <div>
                                            {currentLessonIndex < allLessons.length - 1 ? (
                                                <button
                                                    onClick={handleNext}
                                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-[0_14px_30px_rgba(59,130,246,0.45)]"
                                                >
                                                    Next Lesson
                                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                                </button>
                                            ) : course.quizzes?.length > 0 ? (
                                                <button
                                                    onClick={handleNext}
                                                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-[0_14px_30px_rgba(16,185,129,0.5)]"
                                                >
                                                    Take Quiz
                                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleNext}
                                                    disabled={completing}
                                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 shadow-[0_14px_30px_rgba(22,163,74,0.5)]"
                                                >
                                                    <span className="material-symbols-outlined text-lg">workspace_premium</span>
                                                    {completing ? 'Finishing...' : 'Finish Course'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
                                    Select a lesson from the sidebar to begin
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </motion.div>
    );
}
