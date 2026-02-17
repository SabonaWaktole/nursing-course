'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardStats, Course } from '@/lib/types';
import {
    Users, BookOpen, Award, BarChart3, Plus, Trash2,
    Upload, FileText, ClipboardList, ChevronDown, ChevronUp, X, Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'courses' | 'users' | 'results'>('overview');

    // Course form
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '0' });
    const [saving, setSaving] = useState(false);

    // Module form
    const [showModuleForm, setShowModuleForm] = useState<string | null>(null);
    const [moduleTitle, setModuleTitle] = useState('');

    // Lesson form — needs moduleId
    const [showLessonForm, setShowLessonForm] = useState<string | null>(null); // moduleId
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', materialUrl: '' });
    const [uploading, setUploading] = useState<{ video?: boolean; material?: boolean }>({});

    // Quiz form
    const [showQuizForm, setShowQuizForm] = useState<{ id: string; type: 'course' | 'module'; mode?: 'create' | 'edit'; quizId?: string } | null>(null);
    const [quizForm, setQuizForm] = useState({
        title: '', passingScore: '50',
        questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });

    // Course detail (for viewing modules/lessons)
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
    const [courseDetails, setCourseDetails] = useState<any>(null);

    const [users, setUsers] = useState<any[]>([]);
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') { router.push('/'); return; }
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            const [statsRes, coursesRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/courses'),
            ]);
            setStats(statsRes.data);
            setCourses(coursesRes.data);
            setLoading(false);
        } catch { setLoading(false); }
    };

    const loadCourseDetail = async (courseId: string) => {
        try {
            const res = await api.get(`/courses/${courseId}`);
            setCourseDetails(res.data);
        } catch { }
    };

    const loadUsers = async () => {
        const res = await api.get('/admin/users');
        setUsers(res.data);
    };

    const loadResults = async () => {
        const res = await api.get('/quizzes/results/all');
        setResults(res.data);
    };

    const handleCreateCourse = async () => {
        setSaving(true);
        try {
            await api.post('/courses', courseForm);
            setCourseForm({ title: '', description: '', price: '0' });
            setShowCourseForm(false);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error creating course');
        }
        setSaving(false);
    };

    const handleDeleteCourse = async (id: string) => {
        if (!confirm('Delete this course and all its modules/lessons?')) return;
        try {
            await api.delete(`/courses/${id}`);
            loadData();
            if (expandedCourse === id) { setExpandedCourse(null); setCourseDetails(null); }
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting course');
        }
    };

    const handleAddModule = async (courseId: string) => {
        if (!moduleTitle.trim()) return;
        try {
            await api.post(`/courses/${courseId}/modules`, { title: moduleTitle });
            setModuleTitle('');
            setShowModuleForm(null);
            loadCourseDetail(courseId);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error adding module');
        }
    };

    const handleDeleteModule = async (moduleId: string, courseId: string) => {
        if (!confirm('Delete this module and all its lessons?')) return;
        try {
            await api.delete(`/courses/modules/${moduleId}`);
            loadCourseDetail(courseId);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting module');
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        try {
            await api.post(`/courses/modules/${moduleId}/lessons`, lessonForm);
            setLessonForm({ title: '', description: '', videoUrl: '', materialUrl: '' });
            setShowLessonForm(null);
            // Reload course detail
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error adding lesson');
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Delete this lesson?')) return;
        try {
            await api.delete(`/courses/lessons/${lessonId}`);
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting lesson');
        }
    };

    const handleSaveQuiz = async (targetId: string, type: 'course' | 'module') => {
        try {
            if (showQuizForm?.mode === 'edit' && showQuizForm.quizId) {
                // Update existing quiz
                await api.put(`/quizzes/${showQuizForm.quizId}`, {
                    title: quizForm.title,
                    passingScore: parseInt(quizForm.passingScore),
                    questions: quizForm.questions,
                });
            } else {
                // Create new quiz
                await api.post('/quizzes', {
                    courseId: type === 'course' ? targetId : courseDetails?.id,
                    moduleId: type === 'module' ? targetId : null,
                    title: quizForm.title,
                    passingScore: parseInt(quizForm.passingScore),
                    questions: quizForm.questions,
                });
            }

            setQuizForm({ title: '', passingScore: '50', questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }] });
            setShowQuizForm(null);
            loadData();
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving quiz');
        }
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm('Delete this quiz? This cannot be undone.')) return;
        try {
            await api.delete(`/quizzes/${quizId}`);
            loadData();
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting quiz');
        }
    };

    const handleUpload = async (type: 'video' | 'material') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'video' ? '.mp4,.webm,.mov' : '.pdf,.doc,.docx,.zip';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append(type, file);
            try {
                const res = await api.post(`/upload/${type}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert(`Uploaded! URL: ${res.data.url}`);
            } catch {
                alert('Upload failed');
            }
        };
        input.click();
    };

    const handleLessonUpload = async (type: 'video' | 'material') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'video' ? '.mp4,.webm,.mov' : '.pdf,.doc,.docx,.zip';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            setUploading((prev) => ({ ...prev, [type]: true }));
            const formData = new FormData();
            formData.append(type, file);
            try {
                const res = await api.post(`/upload/${type}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const urlField = type === 'video' ? 'videoUrl' : 'materialUrl';
                setLessonForm((prev) => ({ ...prev, [urlField]: res.data.url }));
            } catch {
                alert(`${type} upload failed`);
            }
            setUploading((prev) => ({ ...prev, [type]: false }));
        };
        input.click();
    };

    const addQuestion = () => {
        setQuizForm((prev) => ({
            ...prev,
            questions: [...prev.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0 }],
        }));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        setQuizForm((prev) => {
            const qs = [...prev.questions];
            (qs[index] as any)[field] = value;
            return { ...prev, questions: qs };
        });
    };

    const updateOption = (qi: number, oi: number, value: string) => {
        setQuizForm((prev) => {
            const qs = [...prev.questions];
            qs[qi].options[oi] = value;
            return { ...prev, questions: qs };
        });
    };

    const openQuizEdit = (quiz: any, type: 'course' | 'module') => {
        // Fetch full quiz details to get questions if needed, or rely on what we have
        // But getCourseById includes quizzes and their questions? No, check controller.
        // Controller only includes _count for list. We might need to fetch the quiz.
        // Let's assume we need to fetch it.
        api.get(`/quizzes/${quiz.id}`).then(res => {
            const q = res.data;
            setQuizForm({
                title: q.title,
                passingScore: q.passingScore.toString(),
                questions: q.questions.map((qn: any) => ({
                    text: qn.text,
                    options: qn.options,
                    correctAnswer: qn.correctAnswer
                }))
            });
            setShowQuizForm({ id: type === 'course' ? (courseDetails?.id || '') : (quiz.moduleId || ''), type, mode: 'edit', quizId: quiz.id });
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
                    <div className="flex gap-2">
                        <button onClick={() => handleUpload('video')} className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900 hover:bg-blue-100 transition">
                            <Upload className="h-3.5 w-3.5" /> Upload Video
                        </button>
                        <button onClick={() => handleUpload('material')} className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900 hover:bg-blue-100 transition">
                            <FileText className="h-3.5 w-3.5" /> Upload Material
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 rounded-lg bg-slate-100 p-1 max-w-md">
                    {(['overview', 'courses', 'users', 'results'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                setTab(t);
                                if (t === 'users') loadUsers();
                                if (t === 'results') loadResults();
                            }}
                            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition capitalize ${tab === t ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {tab === 'overview' && stats && (
                    <div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {[
                                { icon: Users, label: 'Total Users', value: stats.stats.totalUsers, color: 'blue' },
                                { icon: BookOpen, label: 'Total Courses', value: stats.stats.totalCourses, color: 'emerald' },
                                { icon: BarChart3, label: 'Enrollments', value: stats.stats.totalEnrollments, color: 'blue' },
                                { icon: Award, label: 'Certificates', value: stats.stats.totalCertificates, color: 'green' },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                                            <stat.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                            <p className="text-xs text-slate-500">{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-6">
                            <h2 className="font-bold text-slate-900 mb-4">Recent Enrollments</h2>
                            <div className="divide-y divide-slate-100">
                                {stats.recentEnrollments.map((e) => (
                                    <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                                        <div>
                                            <p className="font-medium text-slate-900">{e.user.name}</p>
                                            <p className="text-xs text-slate-500">{e.user.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-700">{e.course.title}</p>
                                            <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {stats.recentEnrollments.length === 0 && (
                                    <p className="py-4 text-sm text-slate-400">No enrollments yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Courses Management */}
                {tab === 'courses' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Manage Courses ({courses.length})</h2>
                            <button
                                onClick={() => setShowCourseForm(!showCourseForm)}
                                className="flex items-center gap-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 transition"
                            >
                                <Plus className="h-4 w-4" /> New Course
                            </button>
                        </div>

                        {showCourseForm && (
                            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 space-y-3">
                                <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Course title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                                <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Description" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={3} />
                                <div className="flex gap-2">
                                    <button onClick={handleCreateCourse} disabled={saving} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50">{saving ? 'Creating...' : 'Create Course'}</button>
                                    <button onClick={() => setShowCourseForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {courses.map((course) => (
                                <div key={course.id} className="rounded-xl border border-slate-200 bg-white">
                                    {/* Course header */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900">{course.title}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{course.description}</p>
                                                <div className="mt-2 flex gap-3 text-xs text-slate-400">
                                                    <span>{course._count?.modules || 0} modules</span>
                                                    <span>{course._count?.quizzes || 0} quizzes</span>
                                                    <span>{course._count?.enrollments || 0} enrolled</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        if (expandedCourse === course.id) {
                                                            setExpandedCourse(null);
                                                            setCourseDetails(null);
                                                        } else {
                                                            setExpandedCourse(course.id);
                                                            loadCourseDetail(course.id);
                                                        }
                                                    }}
                                                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-900 transition"
                                                    title="Toggle modules"
                                                >
                                                    {expandedCourse === course.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>
                                                <button onClick={() => setShowModuleForm(showModuleForm === course.id ? null : course.id)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-900 transition" title="Add Module">
                                                    <Layers className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setShowQuizForm(showQuizForm?.id === course.id ? null : { id: course.id, type: 'course' })} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition" title="Add Exam">
                                                    <ClipboardList className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteCourse(course.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete Course">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add Module Form */}
                                    {showModuleForm === course.id && (
                                        <div className="mx-4 mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                                            <p className="text-sm font-bold text-blue-700">Add Module</p>
                                            <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module title (e.g. Introduction to Patient Care)" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAddModule(course.id)} className="rounded bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800">Add Module</button>
                                                <button onClick={() => { setShowModuleForm(null); setModuleTitle(''); }} className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expanded: show modules and lessons */}
                                    {expandedCourse === course.id && courseDetails && (
                                        <div className="border-t border-slate-100 px-4 pb-4">
                                            {courseDetails.modules?.length === 0 && (
                                                <p className="py-4 text-sm text-slate-400 text-center">No modules yet. Add one above.</p>
                                            )}
                                            {courseDetails.modules?.map((mod: any, mi: number) => (
                                                <div key={mod.id} className="mt-3 rounded-lg border border-slate-200 bg-slate-50">
                                                    {/* Module header */}
                                                    <div className="flex items-center justify-between px-3 py-2">
                                                        <div>
                                                            <span className="text-xs font-semibold text-blue-900 uppercase">Module {mi + 1}</span>
                                                            <span className="ml-2 text-sm font-medium text-slate-800">{mod.title}</span>
                                                            <span className="ml-2 text-xs text-slate-400">({mod.lessons?.length || 0} lessons)</span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => setShowLessonForm(showLessonForm === mod.id ? null : mod.id)}
                                                                className="rounded p-1 text-slate-400 hover:bg-white hover:text-blue-900 transition"
                                                                title="Add Lesson"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setShowQuizForm(showQuizForm?.id === mod.id ? null : { id: mod.id, type: 'module' })}
                                                                className="rounded p-1 text-slate-400 hover:bg-white hover:text-emerald-600 transition"
                                                                title="Add Quiz"
                                                            >
                                                                <ClipboardList className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteModule(mod.id, course.id)}
                                                                className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-600 transition"
                                                                title="Delete Module"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Lessons list */}
                                                    {mod.lessons?.map((lesson: any, li: number) => (
                                                        <div key={lesson.id} className="flex items-center justify-between px-3 py-1.5 pl-8 text-sm border-t border-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-400 font-mono">{mi + 1}.{li + 1}</span>
                                                                <span className="text-slate-700">{lesson.title}</span>
                                                                {lesson.videoUrl && <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-medium">Video</span>}
                                                                {lesson.materialUrl && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-medium">Material</span>}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                                className="rounded p-1 text-slate-300 hover:text-red-500 transition"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* Module Quizzes list */}
                                                    {mod.quizzes?.map((quiz: any) => (
                                                        <div key={quiz.id} className="flex items-center justify-between px-3 py-1.5 pl-8 text-sm border-t border-emerald-50 bg-emerald-50/30">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-emerald-600 uppercase">Quiz</span>
                                                                <span className="text-slate-700">{quiz.title}</span>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => openQuizEdit(quiz, 'module')}
                                                                    className="rounded p-1 text-slate-300 hover:text-blue-900 transition"
                                                                    title="Edit Quiz"
                                                                >
                                                                    <FileText className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                                                    className="rounded p-1 text-slate-300 hover:text-red-500 transition"
                                                                    title="Delete Quiz"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Add Lesson Form (under specific module) */}
                                                    {showLessonForm === mod.id && (
                                                        <div className="border-t border-slate-200 p-3 bg-white rounded-b-lg space-y-2">
                                                            <p className="text-xs font-bold text-blue-700">Add Lesson to {mod.title}</p>
                                                            <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                                            <input value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Description" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />

                                                            {/* Video */}
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-600 mb-1 block">Video</label>
                                                                <div className="flex gap-2">
                                                                    <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="Paste video URL" className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleLessonUpload('video')}
                                                                        disabled={uploading.video}
                                                                        className="flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition shrink-0"
                                                                    >
                                                                        <Upload className="h-3 w-3" />
                                                                        {uploading.video ? 'Uploading...' : 'Upload'}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Material */}
                                                            <div>
                                                                <label className="text-xs font-medium text-slate-600 mb-1 block">Material</label>
                                                                <div className="flex gap-2">
                                                                    <input value={lessonForm.materialUrl} onChange={(e) => setLessonForm({ ...lessonForm, materialUrl: e.target.value })} placeholder="Paste material URL" className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleLessonUpload('material')}
                                                                        disabled={uploading.material}
                                                                        className="flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition shrink-0"
                                                                    >
                                                                        <Upload className="h-3 w-3" />
                                                                        {uploading.material ? 'Uploading...' : 'Upload'}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleAddLesson(mod.id)} className="rounded bg-blue-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800">Add Lesson</button>
                                                                <button onClick={() => setShowLessonForm(null)} className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {/* Final Exams List */}
                                            {courseDetails.quizzes?.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="px-1 text-sm font-bold text-slate-900 mb-2">Final Examinations</h4>
                                                    {courseDetails.quizzes.map((quiz: any) => (
                                                        <div key={quiz.id} className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50">
                                                            <div className="flex items-center justify-between px-3 py-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-emerald-700 uppercase">Exam</span>
                                                                    <span className="text-sm font-medium text-slate-800">{quiz.title}</span>
                                                                    <span className="text-xs text-slate-400">({quiz._count?.questions || 0} questions)</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => openQuizEdit(quiz, 'course')}
                                                                        className="rounded p-1 text-slate-400 hover:bg-white hover:text-blue-900 transition"
                                                                        title="Edit Exam"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteQuiz(quiz.id)}
                                                                        className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-600 transition"
                                                                        title="Delete Exam"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Quiz Creation Form (Unified for Course Exam or Module Quiz) */}
                                    {showQuizForm?.id && (
                                        <div className="mx-4 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 space-y-3">
                                            <p className="text-sm font-bold text-emerald-700 mb-2">
                                                {showQuizForm.mode === 'edit' 
                                                    ? (showQuizForm.type === 'course' ? 'Edit Final Exam' : 'Edit Module Quiz')
                                                    : (showQuizForm.type === 'course' ? 'Create Final Exam' : 'Create Module Quiz')}
                                            </p>
                                            <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder={showQuizForm.type === 'course' ? "Exam title" : "Quiz title"} className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                            <div className="flex items-center gap-3">
                                                <label className="text-xs font-medium text-slate-600">Passing Score %</label>
                                                <input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })} className="w-20 rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                            </div>

                                            {quizForm.questions.map((q, qi) => (
                                                <div key={qi} className="rounded border border-slate-200 bg-white p-3 space-y-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-xs font-bold text-slate-500">Question {qi + 1}</p>
                                                        {quizForm.questions.length > 1 && (
                                                            <button onClick={() => {
                                                                const qs = [...quizForm.questions];
                                                                qs.splice(qi, 1);
                                                                setQuizForm({ ...quizForm, questions: qs });
                                                            }} className="text-red-400 hover:text-red-600">
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} placeholder="Question text" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" />
                                                    {q.options.map((opt, oi) => (
                                                        <div key={oi} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                checked={q.correctAnswer === oi}
                                                                onChange={() => updateQuestion(qi, 'correctAnswer', oi)}
                                                                className="h-3 w-3 text-blue-900"
                                                            />
                                                            <input
                                                                value={opt}
                                                                onChange={(e) => updateOption(qi, oi, e.target.value)}
                                                                placeholder={`Option ${oi + 1}`}
                                                                className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}

                                            <div className="flex gap-2">
                                                <button onClick={addQuestion} className="rounded border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-900">+ Add Question</button>
                                                <button onClick={() => handleSaveQuiz(showQuizForm.id, showQuizForm.type)} className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                                                    {showQuizForm.mode === 'edit' ? 'Save Changes' : (showQuizForm.type === 'course' ? 'Create Exam' : 'Create Quiz')}
                                                </button>
                                                <button onClick={() => setShowQuizForm(null)} className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {tab === 'users' && (
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Enrolled</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Certs</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{u.name || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${u.role === 'ADMIN' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{u._count?.enrollments || 0}</td>
                                        <td className="px-4 py-3 text-slate-600">{u._count?.certificates || 0}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Results Tab */}
                {tab === 'results' && (
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Quiz</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Course</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Score</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.map((r: any) => (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{r.user?.name || '—'}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.quiz?.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.quiz?.course?.title}</td>
                                        <td className="px-4 py-3 font-bold text-slate-900">{r.score}%</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{r.passed ? 'Passed' : 'Failed'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
