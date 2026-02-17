'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CourseDetail, Module, Lesson } from '@/lib/types';
import { Play, FileText, ClipboardList, CheckCircle, ArrowLeft, Download, ArrowRight, Award, ChevronDown, ChevronRight, Lock } from 'lucide-react';
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
                // Find what comes after this quiz
                let foundQuiz = false;
                for (let i = 0; i < (data.modules?.length || 0); i++) {
                    const mod = data.modules[i];
                    if (mod.quizzes?.some(q => q.id === fromQuiz)) {
                        foundQuiz = true;
                        // Go to next module's first lesson
                        if (i + 1 < data.modules.length) {
                            const nextMod = data.modules[i + 1];
                            setExpandedModules(new Set([nextMod.id]));
                            if (nextMod.lessons?.length > 0) {
                                setActiveLesson(nextMod.lessons[0].id);
                            }
                        } else if (data.quizzes?.length > 0) {
                            // No more modules, go to final exam
                            // (Navigation will handle this)
                        }
                        break;
                    }
                }
                if (foundQuiz) return;
            }

            // Default: Auto-expand first module and select first lesson
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

    // Get all lessons in order (flattened from modules) for navigation
    const allLessons: Lesson[] = course?.modules?.flatMap(m => m.lessons) || [];
    const currentLessonIndex = allLessons.findIndex(l => l.id === activeLesson);
    const currentLesson = currentLessonIndex >= 0 ? allLessons[currentLessonIndex] : null;

    // Find which module a lesson belongs to
    const findModuleForLesson = (lessonId: string): Module | undefined => {
        return course?.modules?.find(m => m.lessons.some(l => l.id === lessonId));
    };

    // Progress calculation
    const totalLessons = allLessons.length;

    const handleNext = async () => {
        if (!course || currentLessonIndex < 0) return;

        const currentMod = findModuleForLesson(allLessons[currentLessonIndex].id);
        const moduleLessons = currentMod?.lessons || [];
        const isLastInModule = currentLessonIndex >= 0 && allLessons[currentLessonIndex].id === moduleLessons[moduleLessons.length - 1]?.id;

        if (isLastInModule && currentMod && currentMod.quizzes && currentMod.quizzes.length > 0) {
            // Take module quiz
            router.push(`/quiz/${currentMod.quizzes[0].id}`);
        } else if (currentLessonIndex < allLessons.length - 1) {
            // Go to next lesson
            const nextLesson = allLessons[currentLessonIndex + 1];
            setActiveLesson(nextLesson.id);
            const mod = findModuleForLesson(nextLesson.id);
            if (mod) setExpandedModules(prev => new Set([...prev, mod.id]));
            try {
                // Calculate progress based on completing the current lesson (1-based index)
                // If moving to next lesson, we have completed (currentLessonIndex + 1) lessons
                const newProgress = Math.round(((currentLessonIndex + 1) / totalLessons) * 100);
                if (newProgress > progress) {
                    await api.put(`/courses/${course.id}/progress`, { progress: newProgress });
                    setProgress(newProgress);
                }
            } catch { }
        } else if (course.quizzes?.length > 0) {
            // Last lesson of course, take final exam
            router.push(`/quiz/${course.quizzes[0].id}`);
        } else {
            // Finish course
            setCompleting(true);
            try {
                await api.put(`/courses/${course.id}/progress`, { progress: 100 });
                setProgress(100);
                setCompleting(false);
            } catch { setCompleting(false); }
        }
    };

    if (!course) return (
        <div className="flex min-h-screen items-center justify-center bg-[#f6f6f8]">
            <div className="animate-pulse text-slate-400">Loading course...</div>
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#f6f6f8] font-[Inter,sans-serif]">
            {/* Top Header Bar */}
            <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/courses" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Courses
                    </Link>
                    <span className="text-slate-300">|</span>
                    <h1 className="text-sm font-bold text-slate-900 truncate max-w-[300px]">{course.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Progress bar */}
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">{progress}% complete</span>
                        <div className="h-2 w-32 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Module/Lesson Navigation */}
                <aside className="hidden md:flex w-80 flex-col border-r border-slate-200 bg-white overflow-y-auto">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Course Content</h2>
                        <p className="mt-1 text-xs text-slate-500">{course.modules?.length || 0} modules · {totalLessons} lessons</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto">
                        {course.modules?.map((mod, mi) => (
                            <div key={mod.id} className="border-b border-slate-100">
                                {/* Module header - collapsible */}
                                <button
                                    onClick={() => toggleModule(mod.id)}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition"
                                >
                                    {expandedModules.has(mod.id) ? (
                                        <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Module {mi + 1}</p>
                                        <p className="text-sm font-medium text-slate-800 truncate">{mod.title}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{mod.lessons?.length || 0} lessons</span>
                                </button>

                                {/* Lessons list (expanded) */}
                                {expandedModules.has(mod.id) && (
                                    <div className="bg-slate-50/50">
                                        {mod.lessons?.map((lesson, li) => {
                                            const isActive = activeLesson === lesson.id;
                                            const globalIdx = allLessons.findIndex(l => l.id === lesson.id);
                                            const isCompleted = globalIdx < currentLessonIndex;
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson.id)}
                                                    className={`flex w-full items-center gap-3 px-4 py-2.5 pl-10 text-left transition border-l-[3px] ${isActive
                                                        ? 'border-l-indigo-600 bg-indigo-50 text-indigo-700'
                                                        : 'border-l-transparent hover:bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                    ) : isActive ? (
                                                        <Play className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                                                    )}
                                                    <span className={`text-sm flex-1 truncate ${isActive ? 'font-semibold' : 'font-normal'}`}>
                                                        {mi + 1}.{li + 1} {lesson.title}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {/* Module Quizzes list */}
                                        {mod.quizzes?.map((quiz) => (
                                            <Link
                                                key={quiz.id}
                                                href={`/quiz/${quiz.id}`}
                                                className="flex w-full items-center gap-3 px-4 py-2.5 pl-10 text-left transition border-l-[3px] border-l-transparent hover:bg-slate-100 text-slate-600"
                                            >
                                                <ClipboardList className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-bold text-purple-600 uppercase">Module Quiz</span>
                                                    <span className="text-sm truncate">{quiz.title}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Quizzes (Exams) section */}
                        {course.quizzes?.length > 0 && (
                            <div className="border-b border-slate-100 bg-indigo-50/30">
                                <div className="px-4 py-3">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Final Examination</p>
                                </div>
                                {course.quizzes.map((quiz) => (
                                    <Link
                                        key={quiz.id}
                                        href={`/quiz/${quiz.id}`}
                                        className="flex items-center gap-3 px-4 py-3 pl-10 text-sm text-slate-700 hover:bg-indigo-100/50 transition border-l-[3px] border-l-transparent"
                                    >
                                        <Award className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-900">{quiz.title}</span>
                                            <span className="text-[10px] text-slate-500">{quiz._count?.questions || 0} Questions · Required to Pass</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    {!enrolled && user ? (
                        /* Enrollment CTA */
                        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                            <div className="max-w-md text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                                    <Play className="h-10 w-10 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
                                <p className="mt-3 text-slate-600">{course.description}</p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {course.modules?.length || 0} modules · {totalLessons} lessons · {course.quizzes?.length || 0} quizzes
                                </p>
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 text-base font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {enrolling ? 'Enrolling...' : 'Enroll in this Course'}
                                </button>
                            </div>
                        </div>
                    ) : !user ? (
                        /* Login CTA */
                        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
                            <div className="max-w-md text-center">
                                <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
                                <p className="mt-3 text-slate-600">{course.description}</p>
                                <Link
                                    href="/login"
                                    className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 text-base font-bold text-white transition hover:bg-indigo-700"
                                >
                                    Sign in to Enroll
                                </Link>
                            </div>
                        </div>
                    ) : currentLesson ? (
                        /* Active lesson view */
                        <div className="flex flex-col">
                            {/* Video or PDF player area */}
                            {currentLesson.videoUrl ? (
                                <div className="relative w-full bg-black" style={{ aspectRatio: '16/9', maxHeight: '65vh' }}>
                                    <video
                                        key={currentLesson.id}
                                        controls
                                        className="h-full w-full object-contain"
                                        src={getFileUrl(currentLesson.videoUrl)}
                                    />
                                </div>
                            ) : currentLesson.materialUrl && currentLesson.materialUrl.toLowerCase().endsWith('.pdf') ? (
                                <div className="relative w-full bg-slate-200" style={{ height: '65vh' }}>
                                    <iframe
                                        key={currentLesson.id}
                                        src={getFileUrl(currentLesson.materialUrl)}
                                        className="w-full h-full border-none shadow-inner"
                                        title={currentLesson.title}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center bg-slate-900" style={{ aspectRatio: '16/9', maxHeight: '40vh' }}>
                                    <div className="text-center text-white">
                                        <FileText className="mx-auto h-12 w-12 mb-3 opacity-50" />
                                        <p className="text-lg font-medium">Text-based Lesson</p>
                                    </div>
                                </div>
                            )}

                            {/* Lesson info panel */}
                            <div className="border-t border-slate-200 bg-white p-6">
                                <div className="mx-auto max-w-4xl">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                                                {findModuleForLesson(currentLesson.id)?.title || 'Lesson'}
                                            </p>
                                            <h2 className="mt-1 text-xl font-bold text-slate-900">{currentLesson.title}</h2>
                                            {currentLesson.description && (
                                                <p className="mt-3 text-slate-600 leading-relaxed">{currentLesson.description}</p>
                                            )}
                                        </div>
                                        {currentLesson.materialUrl && (
                                            <a
                                                href={getFileUrl(currentLesson.materialUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                <Download className="h-4 w-4" />
                                                Materials
                                            </a>
                                        )}
                                    </div>

                                    {/* Next button */}
                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                                        {/* Prev button */}
                                        {currentLessonIndex > 0 && (
                                            <button
                                                onClick={() => {
                                                    const prev = allLessons[currentLessonIndex - 1];
                                                    setActiveLesson(prev.id);
                                                    const mod = findModuleForLesson(prev.id);
                                                    if (mod) setExpandedModules(p => new Set([...p, mod.id]));
                                                }}
                                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Previous Lesson
                                            </button>
                                        )}
                                        <div className="ml-auto">
                                            {currentLessonIndex < allLessons.length - 1 ? (
                                                <button
                                                    onClick={handleNext}
                                                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                                                >
                                                    Next Lesson
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            ) : course.quizzes?.length > 0 ? (
                                                <button
                                                    onClick={handleNext}
                                                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700"
                                                >
                                                    Take Quiz
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleNext}
                                                    disabled={completing}
                                                    className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    <Award className="h-4 w-4" />
                                                    {completing ? 'Finishing...' : 'Finish Course'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
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
