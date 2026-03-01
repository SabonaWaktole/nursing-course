'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardStats, Course } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'courses' | 'users' | 'results' | 'certificates'>('overview');
    const [certificates, setCertificates] = useState<any[]>([]);

    // Course form
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '0', category: 'Nursing', thumbnail: '', tags: [] as string[] });
    const [editingCourse, setEditingCourse] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Module form
    const [showModuleForm, setShowModuleForm] = useState<string | null>(null);
    const [moduleTitle, setModuleTitle] = useState('');

    // Lesson form — needs moduleId
    const [showLessonForm, setShowLessonForm] = useState<string | null>(null); // moduleId
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', materialUrl: '' });
    const [uploading, setUploading] = useState<{ video?: boolean; material?: boolean }>({});
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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

    // Sidebar management
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') return;
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            const [statsRes, coursesRes, usersRes, resultsRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/courses'),
                api.get('/admin/users'),
                api.get('/quizzes/results/all')
            ]);
            setStats(statsRes.data);
            setCourses(coursesRes.data);
            setUsers(usersRes.data);
            setResults(resultsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load admin data', error);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete their enrollments and certificates permanently.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error deleting user');
        }
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

    const loadCertificates = async () => {
        try {
            const res = await api.get('/certificates/all'); // Assuming api route, fallback empty if not created yet
            setCertificates(res.data || []);
        } catch {
            setCertificates([]);
        }
    };

    const handleCreateCourse = async () => {
        if (!courseForm.title) return alert('Title required');
        setSaving(true);
        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse}`, courseForm);
                setEditingCourse(null);
            } else {
                await api.post('/courses', courseForm);
            }
            setCourseForm({ title: '', description: '', price: '0', category: 'Nursing', thumbnail: '', tags: [] });
            setShowCourseForm(false);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving course');
        } finally {
            setSaving(false);
        }
    };

    const handleEditCourseInfo = (course: any) => {
        setCourseForm({
            title: course.title,
            description: course.description,
            price: (course.price || 0).toString(),
            category: course.category || 'Nursing',
            thumbnail: course.thumbnail || '',
            tags: course.tags || []
        });
        setEditingCourse(course.id);
        setShowCourseForm(true);
        // Scroll to top or make sure the form is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            setUploadProgress(0);
            try {
                const res = await api.post(`/upload/${type}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percentCompleted);
                        }
                    }
                });
                alert(`Uploaded! URL: ${res.data.url}`);
            } catch {
                alert('Upload failed');
            }
            setUploadProgress(null);
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
            setUploadProgress(0);
            const formData = new FormData();
            formData.append(type, file);
            try {
                const res = await api.post(`/upload/${type}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percentCompleted);
                        }
                    }
                });
                const urlField = type === 'video' ? 'videoUrl' : 'materialUrl';
                setLessonForm((prev) => ({ ...prev, [urlField]: res.data.url }));
            } catch {
                alert(`${type} upload failed`);
            }
            setUploading((prev) => ({ ...prev, [type]: false }));
            setUploadProgress(null);
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
        <div className="flex items-center justify-center py-20 min-h-screen bg-background-light dark:bg-background-dark">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        </div>
    );

    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased transition-colors duration-200 relative"
            >

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
                    ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
                    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
                    transition-all duration-300 ease-in-out
                    lg:static lg:translate-x-0
                    ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                `}>
                    <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-transparent">
                        {/* Clicking logo/brand takes admin back to homepage */}
                        <Link href="/" className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(13,185,242,0.3)] shrink-0">
                                <span className="material-symbols-outlined text-primary text-xl">medical_services</span>
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h1 className="font-bold text-lg tracking-tight leading-none text-slate-900 dark:text-white">Excelcommunity Living Inc</h1>
                                    <p className="text-xs text-slate-500 font-medium">Admin Console</p>
                                </div>
                            )}
                        </Link>
                        {/* Desktop Collapse Toggle */}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">
                                {isSidebarCollapsed ? 'chevron_right' : 'menu_open'}
                            </span>
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                        {[
                            { id: 'overview', icon: 'grid_view', label: 'Overview', onClick: () => setTab('overview') },
                            { id: 'courses', icon: 'menu_book', label: 'Courses', onClick: () => setTab('courses') },
                            { id: 'users', icon: 'people_alt', label: 'Users', onClick: () => { setTab('users'); loadUsers(); } },
                            { id: 'results', icon: 'analytics', label: 'Results', onClick: () => { setTab('results'); loadResults(); } },
                            { id: 'certificates', icon: 'card_membership', label: 'Certificates', onClick: () => { setTab('certificates'); loadCertificates(); } },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    item.onClick();
                                    if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                                    ${tab === item.id
                                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_rgba(13,185,242,0.1)]'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                                    }
                                    ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                                `}
                                title={isSidebarCollapsed ? item.label : ''}
                            >
                                <span className={`material-symbols-outlined text-xl transition-colors ${tab === item.id ? 'text-primary' : 'group-hover:text-primary'}`}>
                                    {item.icon}
                                </span>
                                {!isSidebarCollapsed && (
                                    <span className="font-medium text-sm animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                        <div
                            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                        >
                            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@excelcommunity.com'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">

                    {/* Header */}
                    <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            {/* Mobile Toggle Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>

                            <div className="hidden sm:block">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white capitalize">
                                    {tab === 'overview' ? 'Dashboard Overview' : `${tab} Management`}
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-500 truncate max-w-[200px] sm:max-w-none">
                                    {tab === 'overview' && 'Manage your certification programs and student progress.'}
                                    {tab === 'courses' && 'View and manage all training modules.'}
                                    {tab === 'users' && 'Manage student and staff access.'}
                                    {tab === 'results' && 'Track quiz performance and grades.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="relative hidden md:block">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Global search..."
                                    className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-900 focus:ring-0 rounded-lg text-sm transition-all"
                                />
                            </div>
                            <button className="relative p-2 text-slate-500 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>
                            <button
                                onClick={() => {
                                    const next = !document.documentElement.classList.contains('dark');
                                    if (next) {
                                        document.documentElement.classList.add('dark');
                                        localStorage.setItem('theme', 'dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                        localStorage.setItem('theme', 'light');
                                    }
                                }}
                                className="p-2 text-slate-500 hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined dark:hidden">dark_mode</span>
                                <span className="material-symbols-outlined hidden dark:block">light_mode</span>
                            </button>

                            {(tab === 'overview' || tab === 'courses') && (
                                <div className="flex gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                                    <button onClick={() => handleUpload('video')} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition">
                                        <span className="material-symbols-outlined text-sm">upload</span> Video
                                    </button>
                                    <button onClick={() => handleUpload('material')} className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition">
                                        <span className="material-symbols-outlined text-sm">description</span> Material
                                    </button>
                                </div>
                            )}
                        </div>
                    </header >

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >

                                {/* Overview */}
                                {
                                    tab === 'overview' && stats && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[
                                                    { title: 'Total Students', value: stats.stats.totalUsers, icon: 'groups', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: '+12.5%', trendIcon: 'trending_up', trendColor: 'text-emerald-400' },
                                                    { title: 'Active Courses', value: stats.stats.totalCourses, icon: 'menu_book', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: '+2 units', trendIcon: 'trending_up', trendColor: 'text-emerald-400' },
                                                    { title: 'Enrollments', value: stats.stats.totalEnrollments, icon: 'grade', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: '+5.2%', trendIcon: 'trending_up', trendColor: 'text-emerald-400' },
                                                    { title: 'Certificates', value: stats.stats.totalCertificates, icon: 'verified', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: '12 urgent', trendIcon: 'hourglass_empty', trendColor: 'text-amber-400' },
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-sm dark:shadow-lg">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                                                            <span className={`p-2 rounded-lg material-symbols-outlined border ${stat.color} ${stat.bg} ${stat.border} ${stat.shadow}`}>
                                                                {stat.icon}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</h3>
                                                                <p className={`${stat.trendColor} text-xs font-semibold mt-2 flex items-center gap-1`}>
                                                                    <span className="material-symbols-outlined text-sm">{stat.trendIcon}</span> {stat.trend}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Upload Resources Quick Action */}
                                                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col items-center justify-center text-center">
                                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                                        <span className="material-symbols-outlined text-primary">upload_file</span> Quick Upload
                                                    </h3>
                                                    <div className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_rgba(13,185,242,0.15)] group">
                                                        {uploadProgress !== null ? (
                                                            <div className="w-full flex flex-col items-center justify-center animate-in fade-in duration-300 py-4">
                                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-3 overflow-hidden">
                                                                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                                                                </div>
                                                                <p className="text-sm font-bold text-primary">Uploading... {uploadProgress}%</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-4 border border-slate-200 dark:border-slate-700 group-hover:border-primary/30">
                                                                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                                                                </div>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Drag and drop course materials</p>
                                                                <div className="flex gap-2 w-full justify-center">
                                                                    <button onClick={() => handleUpload('video')} className="px-5 py-2.5 bg-white border border-slate-200 dark:border-slate-700 text-slate-600 dark:bg-slate-800 dark:text-white hover:border-primary text-xs font-bold rounded-lg shadow-sm transition-colors">
                                                                        Upload Video
                                                                    </button>
                                                                    <button onClick={() => handleUpload('material')} className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-sky-400 transition-colors">
                                                                        Upload Material
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Recent Activity */}
                                                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg">
                                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                                                        <span className="material-symbols-outlined text-primary">notifications_active</span> Recent Enrollments
                                                    </h3>
                                                    <div className="space-y-6">
                                                        {stats.recentEnrollments.map((e, i) => {
                                                            const colors = [
                                                                { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'verified', blur: 'bg-emerald-500/20' },
                                                                { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'person_add', blur: 'bg-blue-500/20' },
                                                                { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'school', blur: 'bg-amber-500/20' },
                                                                { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'menu_book', blur: 'bg-purple-500/20' }
                                                            ];
                                                            const color = colors[i % colors.length];

                                                            // Format date nicely
                                                            const date = new Date(e.createdAt);
                                                            const now = new Date();
                                                            const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                                                            let timeStr = `${diffHours} hours ago`;
                                                            if (diffHours < 1) timeStr = 'Just now';
                                                            else if (diffHours > 24) timeStr = `${Math.floor(diffHours / 24)} days ago`;

                                                            return (
                                                                <div key={e.id} className="flex gap-4">
                                                                    <div className="relative">
                                                                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${color.bg} shadow-[0_0_8px_currentColor]`}>
                                                                            <span className="material-symbols-outlined text-sm">{color.icon}</span>
                                                                        </div>
                                                                        <div className={`absolute inset-0 ${color.blur} blur-md rounded-full -z-10`}></div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                            <span className="font-bold text-slate-900 dark:text-white">{e.user.name}</span> enrolled in '{e.course.title}'
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 mt-1">{timeStr}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {stats.recentEnrollments.length === 0 && (
                                                            <p className="text-sm text-slate-500">No recent enrollments to perform.</p>
                                                        )}
                                                    </div>
                                                    <button className="w-full mt-8 py-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        View All Log
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Courses Management */}
                                {
                                    tab === 'courses' && (
                                        <div>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                                <div className="flex gap-3">
                                                    <div className="relative">
                                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">filter_list</span>
                                                        <input className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 w-64 transition-all" placeholder="Filter courses..." type="text" />
                                                    </div>
                                                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 transition-all">
                                                        <option>All Categories</option>
                                                        <option>Nursing</option>
                                                        <option>CNA Prep</option>
                                                        <option>Clinical Skills</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setEditingCourse(null);
                                                        setCourseForm({ title: '', description: '', price: '0', category: 'Nursing', thumbnail: '', tags: [] });
                                                        setShowCourseForm(!showCourseForm);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add</span>
                                                    Add New Course
                                                </button>
                                            </div>

                                            {/* Add/Edit Course Form Outline styling changed to match dark mode aesthetics */}
                                            {showCourseForm && (
                                                <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-slate-800/50 p-6 mb-8 shadow-sm">
                                                    <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                                                        <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                                            <span className="material-symbols-outlined">{editingCourse ? 'edit' : 'add_circle'}</span>
                                                            {editingCourse ? 'Edit Course Details' : 'Create New Course'}
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Course Title</label>
                                                            <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="E.g., CNA Basics 101" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Category</label>
                                                                <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                                                                    <option value="Nursing">Nursing</option>
                                                                    <option value="CNA Prep">CNA Prep</option>
                                                                    <option value="Clinical Skills">Clinical Skills</option>
                                                                    <option value="Certification">Certification</option>
                                                                    <option value="Other">Other</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Price ($)</label>
                                                                <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} placeholder="E.g., 49.99" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Tags (select multiple)</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {['Nursing', 'CNAprep', 'Clinical', 'other', 'etc'].map((t) => (
                                                                    <button
                                                                        key={t}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setCourseForm(prev => ({
                                                                                ...prev,
                                                                                tags: prev.tags.includes(t)
                                                                                    ? prev.tags.filter(tag => tag !== t)
                                                                                    : [...prev.tags, t]
                                                                            }));
                                                                        }}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${courseForm.tags.includes(t)
                                                                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary dark:hover:text-primary'
                                                                            }`}
                                                                    >
                                                                        {t}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Description</label>
                                                            <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description and learning objectives..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" rows={3} />
                                                        </div>

                                                        {/* Thumbnail Upload Area */}
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Course Thumbnail</label>
                                                            <div className="flex border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                                                {courseForm.thumbnail ? (
                                                                    <div className="h-20 w-32 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-r border-slate-300 dark:border-slate-700">
                                                                        <img src={courseForm.thumbnail} alt="Preview" className="h-full w-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-20 w-32 shrink-0 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-xs text-slate-400 border-r border-slate-300 dark:border-slate-700 border-dashed">
                                                                        <span className="material-symbols-outlined text-xl mb-1 opacity-50">image</span>
                                                                        No Image
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 flex items-center p-4 justify-between">
                                                                    <div className="text-sm text-slate-500 truncate mr-4">
                                                                        {courseForm.thumbnail ? 'Thumbnail uploaded successfully.' : 'Upload a high-quality thumbnail (16:9 recommended).'}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const input = document.createElement('input');
                                                                            input.type = 'file';
                                                                            input.accept = '.jpg,.jpeg,.png,.webp,.gif';
                                                                            input.onchange = async (e: any) => {
                                                                                const file = e.target.files[0];
                                                                                if (!file) return;
                                                                                setSaving(true);
                                                                                const formData = new FormData();
                                                                                formData.append('thumbnail', file);
                                                                                try {
                                                                                    const res = await api.post('/upload/thumbnail', formData, {
                                                                                        headers: { 'Content-Type': 'multipart/form-data' },
                                                                                    });
                                                                                    setCourseForm(prev => ({ ...prev, thumbnail: res.data.url }));
                                                                                } catch {
                                                                                    alert('Thumbnail upload failed.');
                                                                                } finally {
                                                                                    setSaving(false);
                                                                                }
                                                                            };
                                                                            input.click();
                                                                        }}
                                                                        className="shrink-0 flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/20 transition-colors"
                                                                        disabled={saving}
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">upload</span>
                                                                        {courseForm.thumbnail ? 'Replace' : 'Browse...'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50 mt-4">
                                                            <button onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="rounded-xl border border-slate-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                                            <button onClick={handleCreateCourse} disabled={saving} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-500 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2">
                                                                {saving ? <span className="material-symbols-outlined animate-spin">refresh</span> : null}
                                                                {saving ? 'Saving...' : (editingCourse ? 'Save Changes' : 'Create Course')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-400">
                                                            <tr>
                                                                <th className="px-6 py-4 font-semibold">Course Title</th>
                                                                <th className="px-6 py-4 font-semibold">Stats</th>
                                                                <th className="px-6 py-4 font-semibold">Categories</th>
                                                                <th className="px-6 py-4 font-semibold">Price</th>
                                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                            {courses.map((course) => (
                                                                <React.Fragment key={course.id}>
                                                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                                        <td className="px-6 py-4 w-1/3">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
                                                                                    {course.thumbnail ? (
                                                                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <span className="material-symbols-outlined text-2xl">school</span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="min-w-0">
                                                                                    <div className="font-bold text-slate-900 dark:text-white truncate">{course.title}</div>
                                                                                    <div className="text-xs text-slate-500 truncate" title={course.description}>{course.description}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                                                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-slate-400">groups</span> {course._count?.enrollments || 0} students</div>
                                                                                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-slate-400">layers</span> {course._count?.modules || 0} modules</div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex flex-wrap gap-1">
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                                                    {course.category}
                                                                                </span>
                                                                                {(course as any).tags?.slice(0, 2).map((t: string) => (
                                                                                    <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                                                                        {t}
                                                                                    </span>
                                                                                ))}
                                                                                {((course as any).tags?.length > 2) && <span className="text-xs text-slate-400">+{((course as any).tags?.length - 2)}</span>}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                                                ${Number(course.price).toFixed(2)}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 transition-colors"
                                                                                    title="Manage Content"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-lg">{expandedCourse === course.id ? 'expand_less' : 'view_list'}</span>
                                                                                </button>
                                                                                <button onClick={() => handleEditCourseInfo(course)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" title="Edit Info">
                                                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                                                </button>
                                                                                <button onClick={() => setShowModuleForm(showModuleForm === course.id ? null : course.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" title="Add Module">
                                                                                    <span className="material-symbols-outlined text-lg">create_new_folder</span>
                                                                                </button>
                                                                                <button onClick={() => setShowQuizForm(showQuizForm?.id === course.id ? null : { id: course.id, type: 'course' })} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors" title="Add Final Exam">
                                                                                    <span className="material-symbols-outlined text-lg">quiz</span>
                                                                                </button>
                                                                                <button onClick={() => handleDeleteCourse(course.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors" title="Delete Course">
                                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>

                                                                    {/* Details Row (Accordion) */}
                                                                    {expandedCourse === course.id && (
                                                                        <tr>
                                                                            <td colSpan={5} className="p-0 border-b-0">
                                                                                <div className="bg-slate-50 dark:bg-slate-900/80 p-6 border-b border-slate-200 dark:border-slate-800 shadow-inner">

                                                                                    {/* Add Module Form */}
                                                                                    {showModuleForm === course.id && (
                                                                                        <div className="mb-6 rounded-xl border border-primary/20 bg-white dark:bg-slate-800 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                                                            <p className="text-sm font-bold text-primary mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-base">create_new_folder</span> Add New Module</p>
                                                                                            <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Module title (e.g. Introduction to Patient Care)" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary mb-3" />
                                                                                            <div className="flex gap-2">
                                                                                                <button onClick={() => handleAddModule(course.id)} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition-colors">Save Module</button>
                                                                                                <button onClick={() => { setShowModuleForm(null); setModuleTitle(''); }} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Modules List */}
                                                                                    {courseDetails && (
                                                                                        <div className="space-y-4">
                                                                                            {courseDetails.modules?.length === 0 && (
                                                                                                <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
                                                                                                    <span className="material-symbols-outlined text-4xl opacity-50">folder_open</span>
                                                                                                    <p className="text-sm font-medium">No modules found for this course.</p>
                                                                                                </div>
                                                                                            )}
                                                                                            {courseDetails.modules?.map((mod: any, mi: number) => (
                                                                                                <div key={mod.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm">
                                                                                                    {/* Module header */}
                                                                                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                                                                                                {mi + 1}
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{mod.title}</div>
                                                                                                                <div className="text-xs text-slate-500">{mod.lessons?.length || 0} lessons • {mod.quizzes?.length || 0} quizzes</div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <button onClick={() => setShowLessonForm(showLessonForm === mod.id ? null : mod.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-primary transition-colors" title="Add Lesson">
                                                                                                                <span className="material-symbols-outlined text-lg">add_circle</span>
                                                                                                            </button>
                                                                                                            <button onClick={() => setShowQuizForm(showQuizForm?.id === mod.id ? null : { id: mod.id, type: 'module' })} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-emerald-500 transition-colors" title="Add Quiz">
                                                                                                                <span className="material-symbols-outlined text-lg">quiz</span>
                                                                                                            </button>
                                                                                                            <button onClick={() => handleDeleteModule(mod.id, course.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-slate-400 hover:text-red-500 transition-colors" title="Delete Module">
                                                                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Lessons list */}
                                                                                                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                                                                                        {mod.lessons?.map((lesson: any, li: number) => (
                                                                                                            <div key={lesson.id} className="flex items-center justify-between px-4 py-2.5 pl-14 group/lesson hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                                                                                <div className="flex items-center gap-3 min-w-0">
                                                                                                                    <span className="text-xs font-medium text-slate-400 w-6">{mi + 1}.{li + 1}</span>
                                                                                                                    <span className="material-symbols-outlined text-slate-400 text-sm">play_circle</span>
                                                                                                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{lesson.title}</span>
                                                                                                                    <div className="flex gap-1.5">
                                                                                                                        {lesson.videoUrl && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Video</span>}
                                                                                                                        {lesson.materialUrl && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Docs</span>}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/lesson:opacity-100 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                                                                                                    <span className="material-symbols-outlined text-base">close</span>
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        ))}

                                                                                                        {/* Module Quizzes list */}
                                                                                                        {mod.quizzes?.map((quiz: any) => (
                                                                                                            <div key={quiz.id} className="flex items-center justify-between px-4 py-2.5 pl-14 group/quiz bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 transition-colors">
                                                                                                                <div className="flex items-center gap-3 min-w-0">
                                                                                                                    <span className="material-symbols-outlined text-emerald-500 text-sm">assignment</span>
                                                                                                                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold truncate">{quiz.title}</span>
                                                                                                                    <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">({quiz._count?.questions || 0} Qs)</span>
                                                                                                                </div>
                                                                                                                <div className="flex items-center gap-1 opacity-0 group-hover/quiz:opacity-100 transition-all">
                                                                                                                    <button onClick={() => openQuizEdit(quiz, 'module')} className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-primary/10 transition-colors">
                                                                                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                                                                                    </button>
                                                                                                                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                                                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>

                                                                                                    {/* Add Lesson Form (under specific module) */}
                                                                                                    {showLessonForm === mod.id && (
                                                                                                        <div className="border-t border-slate-100 dark:border-slate-700/50 p-4 bg-slate-50/50 dark:bg-slate-800/30 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                                                            <div className="max-w-2xl space-y-3 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-primary/20 pl-8 ml-2">
                                                                                                                <p className="text-xs font-bold text-primary flex items-center gap-2 -ml-8"><span className="material-symbols-outlined text-sm bg-primary/10 p-1 rounded-full">add</span> Add Content to Module</p>
                                                                                                                <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson Title" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
                                                                                                                <input value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Brief Description" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />

                                                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                                                    {/* Video */}
                                                                                                                    <div>
                                                                                                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Video URL</label>
                                                                                                                        <div className="flex gap-2">
                                                                                                                            <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="https://..." className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
                                                                                                                            <button type="button" onClick={() => handleLessonUpload('video')} disabled={uploading.video} className="flex items-center gap-1 rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary hover:bg-secondary/20 disabled:opacity-50 transition shrink-0 relative overflow-hidden">
                                                                                                                                {uploading.video && uploadProgress !== null && (
                                                                                                                                    <div className="absolute inset-y-0 left-0 bg-secondary/20 transition-all duration-300 z-0" style={{ width: `${uploadProgress}%` }}></div>
                                                                                                                                )}
                                                                                                                                <span className="material-symbols-outlined text-sm relative z-10">upload</span>
                                                                                                                                <span className="relative z-10">{uploading.video ? (uploadProgress !== null ? `${uploadProgress}%` : '...') : 'Upload'}</span>
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    {/* Material */}
                                                                                                                    <div>
                                                                                                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Document URL</label>
                                                                                                                        <div className="flex gap-2">
                                                                                                                            <input value={lessonForm.materialUrl} onChange={(e) => setLessonForm({ ...lessonForm, materialUrl: e.target.value })} placeholder="https://..." className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
                                                                                                                            <button type="button" onClick={() => handleLessonUpload('material')} disabled={uploading.material} className="flex items-center gap-1 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 disabled:opacity-50 transition shrink-0 relative overflow-hidden">
                                                                                                                                {uploading.material && uploadProgress !== null && (
                                                                                                                                    <div className="absolute inset-y-0 left-0 bg-teal-500/20 transition-all duration-300 z-0" style={{ width: `${uploadProgress}%` }}></div>
                                                                                                                                )}
                                                                                                                                <span className="material-symbols-outlined text-sm relative z-10">upload</span>
                                                                                                                                <span className="relative z-10">{uploading.material ? (uploadProgress !== null ? `${uploadProgress}%` : '...') : 'Upload'}</span>
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>

                                                                                                                <div className="flex gap-2 pt-2">
                                                                                                                    <button onClick={() => handleAddLesson(mod.id)} className="rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow">Save Lesson</button>
                                                                                                                    <button onClick={() => setShowLessonForm(null)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            ))}

                                                                                            {/* Final Exams List */}
                                                                                            {courseDetails.quizzes?.length > 0 && (
                                                                                                <div className="mt-6">
                                                                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                                                                        <span className="material-symbols-outlined text-emerald-500">verified</span> Final Examinations
                                                                                                    </h4>
                                                                                                    <div className="space-y-2">
                                                                                                        {courseDetails.quizzes.map((quiz: any) => (
                                                                                                            <div key={quiz.id} className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors group/exam">
                                                                                                                <div className="flex items-center justify-between px-4 py-3">
                                                                                                                    <div className="flex items-center gap-3">
                                                                                                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                                                                                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                                                                                                        </div>
                                                                                                                        <div>
                                                                                                                            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-300">{quiz.title}</div>
                                                                                                                            <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{quiz._count?.questions || 0} questions • Passing: {quiz.passingScore}%</div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                    <div className="flex gap-1 opacity-0 group-hover/exam:opacity-100 transition-opacity">
                                                                                                                        <button onClick={() => openQuizEdit(quiz, 'course')} className="p-1.5 text-emerald-600/70 hover:text-emerald-600 hover:bg-emerald-500/10 rounded transition-colors" title="Edit Exam">
                                                                                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                                                                                        </button>
                                                                                                                        <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-1.5 text-emerald-600/70 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Delete Exam">
                                                                                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                                                                                        </button>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Quiz Creation Form (Unified for Course Exam or Module Quiz) */}
                                                                                    {showQuizForm?.id && (
                                                                                        <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 p-6 shadow-lg shadow-emerald-500/5 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                                                                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                                                                    <span className="material-symbols-outlined">quiz</span>
                                                                                                </div>
                                                                                                <div>
                                                                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                                                                        {showQuizForm.mode === 'edit'
                                                                                                            ? (showQuizForm.type === 'course' ? 'Edit Final Exam' : 'Edit Module Quiz')
                                                                                                            : (showQuizForm.type === 'course' ? 'Create Final Exam' : 'Create Module Quiz')}
                                                                                                    </h3>
                                                                                                    <p className="text-xs text-slate-500">Add questions and configure passing criteria.</p>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                                                                                <div className="sm:col-span-2">
                                                                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Assessment Title</label>
                                                                                                    <input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder={showQuizForm.type === 'course' ? "E.g., Final Certification Exam" : "E.g., Module 1 Knowledge Check"} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                                                                                </div>
                                                                                                <div>
                                                                                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Passing Score (%)</label>
                                                                                                    <input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="space-y-6 mb-8">
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Questions ({quizForm.questions.length})</h4>
                                                                                                    <button onClick={addQuestion} className="flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/50">
                                                                                                        <span className="material-symbols-outlined text-sm">add</span> Add Question
                                                                                                    </button>
                                                                                                </div>

                                                                                                {quizForm.questions.map((q, qi) => (
                                                                                                    <div key={qi} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 relative group/question">
                                                                                                        {quizForm.questions.length > 1 && (
                                                                                                            <button onClick={() => {
                                                                                                                const qs = [...quizForm.questions];
                                                                                                                qs.splice(qi, 1);
                                                                                                                setQuizForm({ ...quizForm, questions: qs });
                                                                                                            }} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 border border-red-200 dark:border-red-800 flex items-center justify-center opacity-0 group-hover/question:opacity-100 shadow-sm hover:scale-110 transition-all z-10">
                                                                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                                                                            </button>
                                                                                                        )}
                                                                                                        <div className="flex gap-4">
                                                                                                            <div className="w-8 shrink-0 text-center font-bold text-slate-400 bg-white dark:bg-slate-700 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                                                                                                {qi + 1}
                                                                                                            </div>
                                                                                                            <div className="flex-1 space-y-4">
                                                                                                                <textarea value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} placeholder="Type your question here..." className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" rows={2} />

                                                                                                                <div className="space-y-3">
                                                                                                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Answer Options (Select correct answer)</p>
                                                                                                                    {q.options.map((opt, oi) => (
                                                                                                                        <div key={oi} className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${q.correctAnswer === oi ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                                                                                                            <div className="flex items-center justify-center w-6 h-6 shrink-0">
                                                                                                                                <input
                                                                                                                                    type="radio"
                                                                                                                                    name={`q-${qi}-correct`}
                                                                                                                                    checked={q.correctAnswer === oi}
                                                                                                                                    onChange={() => updateQuestion(qi, 'correctAnswer', oi)}
                                                                                                                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded-full cursor-pointer"
                                                                                                                                />
                                                                                                                            </div>
                                                                                                                            <input
                                                                                                                                value={opt}
                                                                                                                                onChange={(e) => updateOption(qi, oi, e.target.value)}
                                                                                                                                placeholder={`Option ${oi + 1}`}
                                                                                                                                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${q.correctAnswer === oi ? 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 focus:border-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:border-slate-400'}`}
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>

                                                                                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                                                                                                <button onClick={() => setShowQuizForm(null)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                                                                                <button onClick={() => handleSaveQuiz(showQuizForm.id, showQuizForm.type)} className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-2">
                                                                                                    <span className="material-symbols-outlined text-base">save</span>
                                                                                                    {showQuizForm.mode === 'edit' ? 'Save Changes' : (showQuizForm.type === 'course' ? 'Create Exam' : 'Create Quiz')}
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}

                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                                    <p className="text-sm text-slate-500">
                                                        Showing <span className="font-medium text-slate-900 dark:text-white">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Users Tab */}
                                {
                                    tab === 'users' && (
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                                            {/* Header section */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                    <div className="relative w-full sm:w-64">
                                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                                        <input className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-slate-900 dark:text-slate-200 transition-all shadow-sm" placeholder="Search users..." type="text" />
                                                    </div>
                                                    <div className="relative w-full sm:w-48">
                                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">filter_list</span>
                                                        <select className="pl-10 pr-8 py-2.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-slate-900 dark:text-slate-200 transition-all shadow-sm appearance-none">
                                                            <option value="">All Roles</option>
                                                            <option value="USER">Student</option>
                                                            <option value="TEACHER">Staff</option>
                                                            <option value="ADMIN">Administrator</option>
                                                        </select>
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 w-full sm:w-auto">
                                                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-primary/30 text-slate-700 dark:text-primary hover:bg-slate-200 dark:hover:bg-primary/10 hover:text-slate-900 dark:hover:text-primary/80 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-lg">file_download</span>
                                                        Export Data
                                                    </button>
                                                    <button className="flex-1 sm:flex-none px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                                        Invite User
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Table */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-400 font-semibold tracking-wider">
                                                            <tr>
                                                                <th className="px-6 py-4" scope="col">
                                                                    <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                                                                        Name
                                                                        <span className="material-symbols-outlined text-sm">unfold_more</span>
                                                                    </div>
                                                                </th>
                                                                <th className="px-6 py-4" scope="col">Email</th>
                                                                <th className="px-6 py-4" scope="col">Role</th>
                                                                <th className="px-6 py-4" scope="col">Stats</th>
                                                                <th className="px-6 py-4" scope="col">Joined</th>
                                                                <th className="px-6 py-4 text-right" scope="col">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                            {users.map((u: any, idx: number) => {
                                                                // Generate a deterministic color based on index
                                                                const colors = [
                                                                    'bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-emerald-600', 'bg-amber-600'
                                                                ];
                                                                const colorClass = colors[idx % colors.length];
                                                                const initials = u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

                                                                return (
                                                                    <tr key={u.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`w-9 h-9 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-slate-900`}>
                                                                                    {initials}
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-medium text-slate-900 dark:text-white">{u.name || '—'}</div>
                                                                                    <div className="text-xs text-slate-500">ID: #{u.id.substring(0, 5)}...</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">{u.email}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.role === 'ADMIN'
                                                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                                                : (u.role === 'TEACHER' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700')
                                                                                }`}>
                                                                                {u.role === 'USER' ? 'Student' : (u.role === 'TEACHER' ? 'Staff' : 'Administrator')}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                                                <span title="Enrollments" className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">menu_book</span> {u._count?.enrollments || 0}</span>
                                                                                <span title="Certificates" className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-slate-400">card_membership</span> {u._count?.certificates || 0}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                                                                            {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="Edit User">
                                                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                                                </button>
                                                                                {user?.id !== u.id && (
                                                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-slate-400 hover:text-red-500 transition-colors" title="Delete User">
                                                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                                    <p className="text-sm text-slate-500">
                                                        Showing <span className="font-medium text-slate-900 dark:text-white">{users.length}</span> user{users.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Results Tab */}
                                {
                                    tab === 'results' && (
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                                            {/* Analytics Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Pass Rate</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">+2.5%</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">88.4%</h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '88.4%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Exams Taken</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">+12%</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{results.length}</h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Score</p>
                                                        <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded text-xs font-medium">-0.8%</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                                        {results.length > 0 ? Math.round(results.reduce((acc: number, r: any) => acc + r.score, 0) / results.length) : 0}/100
                                                    </h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${results.length > 0 ? Math.round(results.reduce((acc: number, r: any) => acc + r.score, 0) / results.length) : 0}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Passed Exams</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">+5.2%</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{results.filter((r: any) => r.passed).length}</h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${results.length > 0 ? (results.filter((r: any) => r.passed).length / results.length) * 100 : 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Certificates Tab */}
                                {
                                    tab === 'certificates' && (
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                                            {/* Summary Cards & Verification */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                                {/* Summary Cards */}
                                                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Issued</span>
                                                            </div>
                                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{certificates.length}</span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center group hover:border-amber-500/30 transition-colors">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-sm">school</span>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Students</span>
                                                            </div>
                                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{users.filter((u: any) => u.role === 'USER').length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Quick Verification</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter certificate ID to verify authenticity instantly.</p>
                                                    <div className="flex gap-2">
                                                        <input className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 transition-colors" placeholder="Cert ID (e.g. CERT-123)" type="text" />
                                                        <button className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center">
                                                            <span className="material-symbols-outlined">search</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Certificates Table */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Issued Certificates Log</h3>
                                                    <div className="flex gap-3">
                                                        <div className="relative">
                                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">filter_list</span>
                                                            <select className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block cursor-pointer transition-colors">
                                                                <option>All Courses</option>
                                                            </select>
                                                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
                                                        </div>
                                                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-transparent dark:border-slate-700">
                                                            Export CSV
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-700 dark:text-slate-400">
                                                            <tr>
                                                                <th className="px-6 py-4 font-semibold shrink-0" scope="col">Certificate ID</th>
                                                                <th className="px-6 py-4 font-semibold min-w-[200px]" scope="col">Student Name</th>
                                                                <th className="px-6 py-4 font-semibold min-w-[200px]" scope="col">Course</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0" scope="col">Date Issued</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0 text-right" scope="col">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                            {certificates.map((c: any, idx: number) => {
                                                                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'];
                                                                const colorClass = colors[idx % colors.length];
                                                                const initials = c.user?.name ? c.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

                                                                return (
                                                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-500">
                                                                            CERT-{new Date(c.issueDate).getFullYear()}-{c.id.substring(0, 4).toUpperCase()}
                                                                        </td>
                                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                                                                                {initials}
                                                                            </div>
                                                                            <span className="truncate">{c.user?.name || '—'}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4 truncate max-w-xs">{c.course?.title}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(c.issueDate).toLocaleDateString()}</td>
                                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="View Details">
                                                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                                                </button>
                                                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="Download PDF">
                                                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {certificates.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                                                        No certificates issued yet.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">
                                                        Showing <span className="font-medium text-slate-900 dark:text-white">{certificates.length}</span> entries
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </motion.div>
        </RoleGuard>
    );
}
