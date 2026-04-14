'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Quiz, QuizResult, Course } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileUrl } from '@/lib/url-utils';
import { useSectionContainerVariants, useSectionItemVariants, useCardHoverMotion, useButtonHoverMotion, imageInViewVariants, viewportOnce } from '@/lib/motion';

export default function QuizPage() {
    const { quizId } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const buttonHover = useButtonHoverMotion();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<(QuizResult & { courseCompleted?: boolean; nextExamId?: string; certificateId?: string; certificateUniqueId?: string; certificateStatus?: string }) | null>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(2700); // 45:00 in seconds
    const [showMap, setShowMap] = useState(false);

    const handleRetry = () => {
        setResult(null);
        setAnswers({});
        setCurrentQuestionIdx(0);
        setTimeLeft(2700);
    };

    useEffect(() => {
        if (!user) return;
        if (!quizId) return;
        api.get(`/quizzes/${quizId}`).then((res) => {
            setQuiz(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [quizId, user, router]);

    useEffect(() => {
        if (result || loading || !quiz) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [result, loading, quiz]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId: string, optionIndex: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        const unansweredCount = quiz.questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            if (!confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) return;
        }
        setSubmitting(true);
        try {
            const res = await api.post(`/quizzes/${quizId}/submit`, { answers });
            setResult(res.data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error submitting quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
        </div>
    );
    if (!quiz) return <div className="text-center py-20 text-slate-500">Quiz not found</div>;

    // Result screen (Matches assesment_and_reward.html)
    if (result) {
        return (
            <RoleGuard allowedRoles={['STUDENT']}>
                <QuizResultScreen
                    result={result}
                    user={user}
                    quiz={quiz}
                    onRetry={handleRetry}
                    courseCompleted={!!result.courseCompleted}
                    nextExamId={result.nextExamId}
                    certificateId={result.certificateId}
                    certificateUniqueId={result.certificateUniqueId}
                    certificateStatus={result.certificateStatus}
                />
            </RoleGuard>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIdx];
    const answeredCount = Object.keys(answers).length;

    return (
        <RoleGuard allowedRoles={['STUDENT']}>
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950"
            >
                <header className="fixed top-0 inset-x-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
                        <div className="flex justify-between items-center gap-4">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 group">
                                <motion.span
                                    whileHover={{ rotate: 8, scale: 1.05 }}
                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                    className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_26px_rgba(13,185,242,0.65)]"
                                >
                                    medical_services
                                </motion.span>
                                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                    Excel Community Living Inc
                                </span>
                            </Link>

                            {/* Quiz Info Pill */}
                            <nav className="hidden md:flex items-center gap-2 rounded-full bg-slate-900/3 dark:bg-slate-900/70 px-4 py-1.5 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-2xl shadow-[0_10px_35px_rgba(15,23,42,0.22)]">
                                <span className="material-symbols-outlined text-primary text-lg">quiz</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{quiz.title}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{quiz.moduleId ? 'Module Quiz' : 'Final Examination'} • Q{currentQuestionIdx + 1}/{quiz.questions.length}</span>
                                </div>
                            </nav>

                            {/* Right side */}
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">timer</span>
                                    <span className={`text-sm font-semibold font-mono ${timeLeft < 300 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{formatTime(timeLeft)}</span>
                                </div>
                                <ThemeToggle />
                                <motion.button
                                    {...buttonHover}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors duration-200 shadow-[0_18px_35px_rgba(13,185,242,0.45)]"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </header>
                {/* Spacer for fixed header */}
                <div className="h-[68px]"></div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar (Question Map) */}
                    <aside className={`w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col hidden lg:flex z-20`}>
                        <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Question Map</h2>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{answeredCount}/{quiz.questions.length} Answered</span>
                            </div>
                            <div className="flex gap-4 text-xs text-slate-500 mb-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-900"></div>
                                    <span>Current</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-200"></div>
                                    <span>Answered</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <div className="grid grid-cols-5 gap-3">
                                {quiz.questions.map((q, i) => {
                                    const isCurrent = i === currentQuestionIdx;
                                    const isAnswered = answers[q.id] !== undefined;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => setCurrentQuestionIdx(i)}
                                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all relative ${isCurrent
                                                ? 'bg-blue-900 text-white shadow-md ring-2 ring-blue-600 ring-offset-2 scale-105 z-10'
                                                : isAnswered
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            {i + 1}
                                            {isAnswered && !isCurrent && (
                                                <div className="absolute -top-1 -right-1">
                                                    <span className="material-symbols-outlined text-[10px] bg-white rounded-full text-green-600">check_circle</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-lg">person</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{user?.name}</span>
                                    <span className="text-[10px] text-slate-500">Student ID: #{user?.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Quiz Area */}
                    <main className="flex-1 flex flex-col items-center overflow-y-auto bg-slate-50 relative">
                        <motion.div
                            key={currentQuestionIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full max-w-3xl px-6 py-8 md:py-12 flex flex-col gap-8"
                        >
                            {/* Progress */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs font-semibold tracking-wider text-blue-900 uppercase mb-1 block">Question Section</span>
                                        <h2 className="text-2xl font-bold text-slate-900">Question {currentQuestionIdx + 1}</h2>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500 hidden md:block">Step {currentQuestionIdx + 1} of {quiz.questions.length}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-blue-900 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Question Card */}
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.04)] border border-slate-200/50 dark:border-slate-700/50">
                                <p className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-8">
                                    {currentQuestion.text}
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion.options.map((option, oi) => {
                                        const isSelected = answers[currentQuestion.id] === oi;
                                        const label = String.fromCharCode(65 + oi);
                                        return (
                                            <label
                                                key={oi}
                                                className={`group relative flex items-center p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm ${isSelected
                                                    ? 'border-primary bg-primary/10 ring-1 ring-primary/20'
                                                    : 'border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={currentQuestion.id}
                                                    className="sr-only"
                                                    checked={isSelected}
                                                    onChange={() => handleAnswer(currentQuestion.id, oi)}
                                                />
                                                <div className={`flex items-center justify-center size-8 rounded-full text-sm font-bold mr-4 shrink-0 transition-transform group-hover:scale-110 ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {label}
                                                </div>
                                                <span className={`text-base md:text-lg font-medium flex-1 ${isSelected ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {option}
                                                </span>
                                                {isSelected && (
                                                    <div className="absolute right-5 text-primary">
                                                        <span className="material-symbols-outlined">check_circle</span>
                                                    </div>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto">
                                <motion.button
                                    {...buttonHover}
                                    onClick={() => setCurrentQuestionIdx(idx => Math.max(0, idx - 1))}
                                    disabled={currentQuestionIdx === 0}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors duration-200"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Previous
                                </motion.button>
                                {currentQuestionIdx < quiz.questions.length - 1 ? (
                                    <motion.button
                                        {...buttonHover}
                                        onClick={() => setCurrentQuestionIdx(idx => idx + 1)}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors duration-200"
                                    >
                                        Next Question
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        {...buttonHover}
                                        onClick={handleSubmit}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 transition-colors duration-200"
                                    >
                                        Finish & Submit
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </main>
                </div>
            </motion.div>
        </RoleGuard>
    );
}

function QuizResultScreen({ result, user, quiz, onRetry, courseCompleted, nextExamId, certificateId, certificateUniqueId, certificateStatus }: {
    result: QuizResult & { courseCompleted?: boolean, nextExamId?: string, certificateId?: string, certificateUniqueId?: string, certificateStatus?: string },
    user: any,
    quiz: Quiz,
    onRetry: () => void,
    courseCompleted: boolean,
    nextExamId?: string,
    certificateId?: string,
    certificateUniqueId?: string,
    certificateStatus?: string
}) {
    const [courses, setCourses] = useState<Course[]>([]);
    const isExam = !quiz.moduleId;
    const sectionContainer = useSectionContainerVariants();
    const sectionItem = useSectionItemVariants();
    const cardHover = useCardHoverMotion();
    const buttonHover = useButtonHoverMotion();

    useEffect(() => {
        api.get('/courses').then(res => setCourses(res.data.slice(0, 4)));
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col font-sans overflow-x-hidden"
        >
            <header className="fixed top-0 inset-x-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
                    <div className="flex justify-between items-center gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.span
                                whileHover={{ rotate: 8, scale: 1.05 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_26px_rgba(13,185,242,0.65)]"
                            >
                                medical_services
                            </motion.span>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                Excel Community Living Inc
                            </span>
                        </Link>

                        {/* Result Badge Pill */}
                        <nav className="hidden md:flex items-center gap-2 rounded-full bg-slate-900/3 dark:bg-slate-900/70 px-4 py-1.5 border border-slate-200/60 dark:border-slate-800/80 backdrop-blur-2xl shadow-[0_10px_35px_rgba(15,23,42,0.22)]">
                            <span className="material-symbols-outlined text-primary text-lg">assessment</span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assessment Results</span>
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <div className="size-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/* Spacer for fixed header */}
            <div className="h-[68px]"></div>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <motion.div
                    variants={sectionItem}
                    initial="hidden"
                    animate="show"
                    className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden"
                >
                    {/* Decorative Blurs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 z-10">
                        {result.passed ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Passed Successfully
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/10 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                Not Passed
                            </div>
                        )}

                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                            {result.passed ? `Congratulations, ${user?.name?.split(' ')[0]}!` : `Don't give up, ${user?.name?.split(' ')[0]}!`}
                        </h1>
                        <p className="text-slate-500 text-lg mb-8 max-w-xl">
                            {result.passed
                                ? `You've successfully completed the ${isExam ? 'final exam' : 'module quiz'}. ${courseCompleted ? "You've successfully passed all required exams and are now eligible for your certificate!" : nextExamId ? "Great job! Please continue to the next required exam." : isExam ? "Great start! You've passed this exam. Complete all other final exams to get your certificate." : "Great job! You've mastered this module's content."}`
                                : `You didn't reach the required passing score this time. Review your course materials and try again. You've got this!`
                            }
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {result.passed ? (
                                <>
                                    {courseCompleted ? (
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {certificateStatus === 'APPROVED' ? (
                                                <>
                                                    {certificateUniqueId && (
                                                        <motion.span {...buttonHover}>
                                                            <Link href={`/certificate/verify/${certificateUniqueId}`} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-primary/20">
                                                                <span className="material-symbols-outlined">workspace_premium</span>
                                                                View Certificate
                                                            </Link>
                                                        </motion.span>
                                                    )}
                                                    {certificateId && (
                                                        <motion.button
                                                            {...buttonHover}
                                                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/certificates/download/${certificateId}`)}
                                                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-green-500/20"
                                                        >
                                                            <span className="material-symbols-outlined">download</span>
                                                            Download PDF
                                                        </motion.button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-6 py-3.5 rounded-lg font-semibold">
                                                    <span className="material-symbols-outlined animate-spin-slow">hourglass_empty</span>
                                                    Certificate Pending Admin Approval
                                                </div>
                                            )}
                                            <motion.span {...buttonHover}>
                                                <Link href="/certificates" className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-lg font-medium transition-colors duration-200">
                                                    <span className="material-symbols-outlined">folder</span>
                                                    All Certificates
                                                </Link>
                                            </motion.span>
                                        </div>
                                    ) : nextExamId ? (
                                        <motion.span {...buttonHover}>
                                            <Link
                                                href={`/quiz/${nextExamId}`}
                                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-primary/20"
                                            >
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                                Next Final Exam
                                            </Link>
                                        </motion.span>
                                    ) : (
                                        <motion.span {...buttonHover}>
                                            <Link
                                                href={`/courses/${quiz.courseId}?fromQuiz=${quiz.id}`}
                                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-primary/20"
                                            >
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                                {isExam ? 'Back to Course' : 'Next Lesson'}
                                            </Link>
                                        </motion.span>
                                    )}
                                </>
                            ) : (
                                <motion.button {...buttonHover} onClick={onRetry} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-lg font-semibold transition-colors duration-200 shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined">refresh</span>
                                    Try Again
                                </motion.button>
                            )}
                            <motion.span {...buttonHover}>
                                <Link href="/courses" className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-lg font-medium transition-colors duration-200">
                                    <span className="material-symbols-outlined">dashboard</span>
                                    Back to Dashboard
                                </Link>
                            </motion.span>
                        </div>
                    </div>

                    {/* Circular Chart */}
                    <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-sm lg:max-w-md">
                        <div className="relative size-60 md:size-72">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="text-slate-100"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className={result.passed ? 'text-blue-900' : 'text-orange-500'}
                                    strokeWidth="8"
                                    strokeDasharray={42 * 2 * Math.PI}
                                    strokeDashoffset={42 * 2 * Math.PI * (1 - result.score / 100)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                                    {result.score}<span className="text-2xl align-top">%</span>
                                </span>
                                <span className="text-sm font-medium text-slate-500 mt-1">{isExam ? 'Final Exam' : 'Quiz'} Score</span>
                            </div>

                            {result.passed && isExam && (
                                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce shadow-blue-100">
                                    <div className="size-10 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                                        <span className="material-symbols-outlined">workspace_premium</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">CNA Certified</span>
                                        <span className="text-[10px] text-slate-500">Issue Date: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                    variants={sectionContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                    className="mt-16"
                >
                    <motion.div variants={sectionItem} className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recommended Next Steps</h3>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <motion.div key={course.id} variants={sectionItem} {...cardHover}>
                                <Link href={`/courses/${course.id}`} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-lg transition-shadow duration-200 flex flex-col h-full block">
                                    <div className="relative h-40 overflow-hidden">
                                        <motion.img
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={viewportOnce}
                                            variants={imageInViewVariants}
                                            src={course.thumbnail ? getFileUrl(course.thumbnail) : 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            alt=""
                                        />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-900 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-yellow-500 text-[12px]">star</span>
                                        4.8
                                    </div>
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-900 transition-colors line-clamp-2">{course.title}</h3>
                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-primary">${course.price}</span>
                                            {course.credit ? <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[10px]">star</span> Credit: {course.credit}hr</span> : null}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">Enrol Now →</span>
                                    </div>
                                </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>

            <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-8 text-center mt-auto">
                <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Excel Community Living Inc. Clinical Academy of Nursing Professionals.</p>
            </footer>
        </motion.div>
    );
}
