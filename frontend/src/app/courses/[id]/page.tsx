'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CourseDetail, Module, Lesson } from '@/lib/types';
import Link from 'next/link';
import { getFileUrl } from '@/lib/url-utils';

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

            if (data.modules?.length > 0) {
                const firstMod = data.modules[0];
                setExpandedModules(new Set([firstMod.id]));
                if (firstMod.lessons?.length > 0) {
                    setActiveLesson(firstMod.lessons[0].id);
                }
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
                }
            }).catch(() => { });
        }
    }, [user, course]);

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

        if (newProgress > progress) {
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
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Left Sidebar: Course Navigation */}
                <aside className="w-full lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col shrink-0">
                    {/* Progress */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Progress</span>
                            <span className="text-primary font-bold text-sm">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
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
                                            const isCompleted = globalIdx < currentLessonIndex;
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
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">workspace_premium</span>
                                <span>{enrolling ? 'Enrolling...' : 'Enroll in Course'}</span>
                            </button>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
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
                        <div className="max-w-4xl mx-auto p-6 md:p-10">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                                <Link href="/courses" className="hover:text-primary transition-colors">All Courses</Link>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="text-slate-900 dark:text-slate-100 font-medium truncate">{currentLesson.title}</span>
                            </nav>

                            {/* Lesson Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">{currentLesson.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                    {currentLesson.videoUrl && (
                                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-lg text-primary">video_library</span>
                                            <span>Video Lesson</span>
                                        </div>
                                    )}
                                    {currentLesson.materialUrl && (
                                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-lg text-primary">assignment</span>
                                            <span>Materials</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                                        <span>{findModuleForLesson(currentLesson.id)?.title || 'Module'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Video/PDF Player */}
                            {currentLesson.videoUrl ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black group mb-10">
                                    <video
                                        key={currentLesson.id}
                                        controls
                                        className="h-full w-full object-contain"
                                        src={getFileUrl(currentLesson.videoUrl)}
                                    />
                                </div>
                            ) : currentLesson.materialUrl && currentLesson.materialUrl.toLowerCase().endsWith('.pdf') ? (
                                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800 mb-10" style={{ height: '65vh' }}>
                                    <iframe
                                        key={currentLesson.id}
                                        src={getFileUrl(currentLesson.materialUrl)}
                                        className="w-full h-full border-none"
                                        title={currentLesson.title}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center bg-slate-900 rounded-xl aspect-video mb-10" style={{ maxHeight: '40vh' }}>
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
                                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
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
                                            className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all"
                                        >
                                            Next Lesson
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </button>
                                    ) : course.quizzes?.length > 0 ? (
                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all"
                                        >
                                            Take Quiz
                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNext}
                                            disabled={completing}
                                            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
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
                </main>
            </div>
        </div>
    );
}
