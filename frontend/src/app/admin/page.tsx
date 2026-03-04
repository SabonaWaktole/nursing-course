'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardStats, Course } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import { getFileUrl } from '@/lib/url-utils';

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
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // User management
    const [showUserForm, setShowUserForm] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });

    // Sidebar management
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initialize theme state
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') return;
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            const [statsRes, coursesRes, usersRes, resultsRes, notifsRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/courses'),
                api.get('/admin/users'),
                api.get('/quizzes/results/all'),
                api.get('/admin/notifications')
            ]);
            setStats(statsRes.data);
            setCourses(coursesRes.data);
            setUsers(usersRes.data);
            setResults(resultsRes.data);
            setNotifications(notifsRes.data);
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
            const res = await api.get('/admin/certificates');
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

    const handleCreateUser = async () => {
        if (!userForm.email || !userForm.password) return alert('Email and password required');
        setSaving(true);
        try {
            await api.post('/admin/users', userForm);
            setUserForm({ name: '', email: '', password: '', role: 'STUDENT' });
            setShowUserForm(false);
            loadUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error creating user');
        } finally {
            setSaving(false);
        }
    };

    const handleApproveCertificate = async (certId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/admin/certificates/${certId}/status`, { status });
            loadCertificates();
            // Refresh notifications too
            const notifsRes = await api.get('/admin/notifications');
            setNotifications(notifsRes.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error updating certificate status');
        }
    };

    const handleRevokeCertificate = async (certId: string) => {
        if (!confirm('Are you sure you want to revoke this certificate? The student\'s course progress will be reset to 0%.')) return;
        try {
            await api.patch(`/admin/certificates/${certId}/revoke`);
            loadCertificates();
            const notifsRes = await api.get('/admin/notifications');
            setNotifications(notifsRes.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error revoking certificate');
        }
    };

    const markRead = async (id: string) => {
        try {
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch { }
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

                <AdminSidebar
                    tab={tab}
                    setTab={setTab}
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    loadUsers={loadUsers}
                    loadResults={loadResults}
                    loadCertificates={loadCertificates}
                />

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
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-slate-500 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined">notifications</span>
                                    {notifications.some(n => !n.read) && (
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <h4 className="font-bold text-sm">Notifications</h4>
                                            <span className="text-[10px] font-black uppercase text-primary px-2 py-0.5 bg-primary/10 rounded">
                                                {notifications.filter(n => !n.read).length} New
                                            </span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((n: any) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => { markRead(n.id); if (n.type === 'EXAM_COMPLETED') setTab('certificates'); setShowNotifications(false); }}
                                                        className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'EXAM_COMPLETED' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                                                                }`}>
                                                                <span className="material-symbols-outlined text-lg">
                                                                    {n.type === 'EXAM_COMPLETED' ? 'grade' : 'verified_user'}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold truncate">{n.title}</p>
                                                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                                                                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-12 text-center">
                                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">notifications_off</span>
                                                    <p className="text-xs text-slate-500">No notifications yet</p>
                                                </div>
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                                                <button className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors">Clear All</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    const next = !document.documentElement.classList.contains('dark');
                                    setIsDark(next);
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
                                <span className="material-symbols-outlined">
                                    {isDark ? 'light_mode' : 'dark_mode'}
                                </span>
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
                                                    { title: 'Total Students', value: stats.stats.totalUsers, icon: 'groups', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: `${stats.stats.trends.users >= 0 ? '+' : ''}${stats.stats.trends.users}%`, trendIcon: stats.stats.trends.users >= 0 ? 'trending_up' : 'trending_down', trendColor: stats.stats.trends.users >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                                                    { title: 'Active Courses', value: stats.stats.totalCourses, icon: 'menu_book', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: `${stats.stats.trends.courses >= 0 ? '+' : ''}${stats.stats.trends.courses}%`, trendIcon: stats.stats.trends.courses >= 0 ? 'trending_up' : 'trending_down', trendColor: stats.stats.trends.courses >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                                                    { title: 'Enrollments', value: stats.stats.totalEnrollments, icon: 'grade', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: `${stats.stats.trends.enrollments >= 0 ? '+' : ''}${stats.stats.trends.enrollments}%`, trendIcon: stats.stats.trends.enrollments >= 0 ? 'trending_up' : 'trending_down', trendColor: stats.stats.trends.enrollments >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                                                    { title: 'Certificates', value: stats.stats.totalCertificates, icon: 'verified', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_8px_rgba(13,185,242,0.2)]', trend: `${stats.stats.trends.certificates >= 0 ? '+' : ''}${stats.stats.trends.certificates}%`, trendIcon: stats.stats.trends.certificates >= 0 ? 'trending_up' : 'trending_down', trendColor: stats.stats.trends.certificates >= 0 ? 'text-emerald-400' : 'text-rose-400' },
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
                                                        {stats?.recentEnrollments?.map((e, i) => {
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
                                                                            <span className="font-bold text-slate-900 dark:text-white">{e.user.name}</span> enrolled in &apos;{e.course.title}&apos;
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 mt-1">{timeStr}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {(!stats || stats.recentEnrollments.length === 0) && (
                                                            <p className="text-sm text-slate-500">No recent enrollments available.</p>
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
                                        <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl p-1">
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

                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Course Thumbnail</label>
                                                            <div className="flex border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                                                {courseForm.thumbnail ? (
                                                                    <div className="h-20 w-32 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-r border-slate-300 dark:border-slate-700">
                                                                        <img src={getFileUrl(courseForm.thumbnail)} alt="Preview" className="h-full w-full object-cover" />
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

                                            <div className="mt-8 grid grid-cols-1 gap-8">
                                                {courses.map((course) => (
                                                    <motion.div
                                                        key={course.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500 group overflow-hidden"
                                                    >
                                                        <div className="p-8">
                                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                                                <div className="flex items-start gap-6 flex-1 min-w-0">
                                                                    <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                                        {course.thumbnail ? <img src={getFileUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-4xl">school</span>}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{course.category}</span>
                                                                            {((course as any).tags || []).slice(0, 2).map((t: string) => <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">{t}</span>)}
                                                                        </div>
                                                                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-1">{course.title}</h3>
                                                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words line-clamp-2 max-w-2xl">{course.description}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-6 lg:gap-10 shrink-0">
                                                                    <div className="flex items-center gap-4 text-left">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</span>
                                                                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                                                <span className="material-symbols-outlined text-base text-primary">groups</span> {course._count?.enrollments || 0}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modules</span>
                                                                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                                                <span className="material-symbols-outlined text-base text-primary">layers</span> {course._count?.modules || 0}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                                                                        <div className="text-xl font-black text-slate-900 dark:text-white">${Number(course.price).toFixed(2)}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (expandedCourse === course.id) { setExpandedCourse(null); setCourseDetails(null); }
                                                                            else { setExpandedCourse(course.id); loadCourseDetail(course.id); }
                                                                        }}
                                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${expandedCourse === course.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'}`}
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">{expandedCourse === course.id ? 'expand_less' : 'view_list'}</span>
                                                                        {expandedCourse === course.id ? 'Close' : 'Manage Content'}
                                                                    </button>
                                                                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                                                                        <button onClick={() => handleEditCourseInfo(course)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary transition-colors" title="Edit Info"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (expandedCourse !== course.id) {
                                                                                    setExpandedCourse(course.id);
                                                                                    loadCourseDetail(course.id);
                                                                                }
                                                                                setShowModuleForm(showModuleForm === course.id ? null : course.id);
                                                                            }}
                                                                            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                                                                            title="Add Module"
                                                                        >
                                                                            <span className="material-symbols-outlined text-lg">create_new_folder</span>
                                                                        </button>
                                                                        <button onClick={() => setShowQuizForm({ id: course.id, type: 'course', mode: 'create' })} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors" title="Add Final Exam"><span className="material-symbols-outlined text-lg">quiz</span></button>
                                                                        <button onClick={() => handleDeleteCourse(course.id)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors" title="Delete Course"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <AnimatePresence>
                                                            {expandedCourse === course.id && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800">
                                                                    <div className="p-6 space-y-6">
                                                                        {showModuleForm === course.id && (
                                                                            <div className="mb-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-primary/20 shadow-sm animate-in fade-in zoom-in-95">
                                                                                <p className="text-xs font-bold text-primary uppercase mb-2">New Module</p>
                                                                                <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Title..." className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm mb-3" />
                                                                                <div className="flex gap-2">
                                                                                    <button onClick={() => handleAddModule(course.id)} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">Create</button>
                                                                                    <button onClick={() => setShowModuleForm(null)} className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">Cancel</button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        <div className="space-y-4">
                                                                            {courseDetails?.modules?.map((mod: any, mi: number) => (
                                                                                <div key={mod.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                                                                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{mi + 1}</span>
                                                                                            <h4 className="text-sm font-bold">{mod.title}</h4>
                                                                                        </div>
                                                                                        <div className="flex gap-1">
                                                                                            <button onClick={() => setShowLessonForm(showLessonForm === mod.id ? null : mod.id)} className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">add_circle</span></button>
                                                                                            <button onClick={() => setShowQuizForm({ id: mod.id, type: 'module', mode: mod.quizzes?.length > 0 ? 'edit' : 'create', quizId: mod.quizzes?.[0]?.id })} className="p-1 hover:text-emerald-500 transition-colors"><span className="material-symbols-outlined text-lg">quiz</span></button>
                                                                                            <button onClick={() => handleDeleteModule(mod.id, course.id)} className="p-1 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="p-3 space-y-2">
                                                                                        {mod.lessons?.map((lesson: any) => (
                                                                                            <div key={lesson.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-950/50 rounded-lg group/lesson transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                                                                                                <div className="flex items-center gap-3">
                                                                                                    <span className="material-symbols-outlined text-slate-400 text-sm">play_circle</span>
                                                                                                    <div className="flex flex-col">
                                                                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{lesson.title}</span>
                                                                                                        <div className="flex gap-2">
                                                                                                            {lesson.videoUrl && <span className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">videocam</span> Video</span>}
                                                                                                            {lesson.materialUrl && <span className="text-[9px] font-black uppercase text-sky-500 flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">description</span> PDF</span>}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="opacity-0 group-hover/lesson:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                                                            </div>
                                                                                        ))}
                                                                                        {mod.quizzes?.map((quiz: any) => (
                                                                                            <div key={quiz.id} className="flex justify-between items-center p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                                                                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500 text-sm">task_alt</span><span className="text-xs font-bold text-emerald-600">Quiz: {quiz.title}</span></div>
                                                                                                <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-1 text-emerald-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">close</span></button>
                                                                                            </div>
                                                                                        ))}
                                                                                        {showLessonForm === mod.id && (
                                                                                            <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2">
                                                                                                <div className="space-y-3">
                                                                                                    <input
                                                                                                        value={lessonForm.title}
                                                                                                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                                                                                        placeholder="Lesson Title"
                                                                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold"
                                                                                                    />
                                                                                                    <textarea
                                                                                                        value={lessonForm.description}
                                                                                                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                                                                                                        placeholder="Lesson Description (optional)"
                                                                                                        rows={2}
                                                                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                                                                                                    />

                                                                                                    <div className="grid grid-cols-2 gap-3">
                                                                                                        <div className="space-y-1">
                                                                                                            <button
                                                                                                                onClick={() => handleLessonUpload('video')}
                                                                                                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${lessonForm.videoUrl ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary hover:text-primary'}`}
                                                                                                            >
                                                                                                                <span className="material-symbols-outlined text-sm">{lessonForm.videoUrl ? 'check_circle' : 'videocam'}</span>
                                                                                                                {uploading.video ? 'Uploading...' : (lessonForm.videoUrl ? 'Video Added' : 'Add Video')}
                                                                                                            </button>
                                                                                                        </div>
                                                                                                        <div className="space-y-1">
                                                                                                            <button
                                                                                                                onClick={() => handleLessonUpload('material')}
                                                                                                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${lessonForm.materialUrl ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary hover:text-primary'}`}
                                                                                                            >
                                                                                                                <span className="material-symbols-outlined text-sm">{lessonForm.materialUrl ? 'check_circle' : 'description'}</span>
                                                                                                                {uploading.material ? 'Uploading...' : (lessonForm.materialUrl ? 'PDF Added' : 'Add PDF')}
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {uploadProgress !== null && (
                                                                                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                                                                                                            <motion.div
                                                                                                                initial={{ width: 0 }}
                                                                                                                animate={{ width: `${uploadProgress}%` }}
                                                                                                                className="bg-primary h-full"
                                                                                                            />
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>

                                                                                                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                                                                                    <button onClick={() => handleAddLesson(mod.id)} className="flex-1 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Create Lesson</button>
                                                                                                    <button onClick={() => setShowLessonForm(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {courseDetails?.quizzes?.length > 0 && (
                                                                            <div className="p-4 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/10 flex justify-between items-center">
                                                                                <div className="flex items-center gap-3"><span className="material-symbols-outlined text-emerald-500">verified</span><div><p className="text-sm font-bold">Final Certification Exam</p><p className="text-[10px] text-emerald-600">{courseDetails.quizzes[0].title}</p></div></div>
                                                                                <div className="flex items-center gap-2"><button onClick={() => openQuizEdit(courseDetails.quizzes[0], 'course')} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-500/20 text-emerald-600 rounded-lg text-xs font-bold">Edit</button><button onClick={() => handleDeleteQuiz(courseDetails.quizzes[0].id)} className="hover:text-red-500 transition-colors"><span className="material-symbols-outlined">delete</span></button></div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {showQuizForm && (
                                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                                                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><span className="material-symbols-outlined">quiz</span></div><h3 className="text-xl font-bold">{showQuizForm.mode === 'edit' ? 'Edit Quiz' : 'Create New Assessment'}</h3></div>
                                                            <button onClick={() => setShowQuizForm(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
                                                        </div>
                                                        <div className="p-6 overflow-y-auto space-y-8">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Title</label><input value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm" /></div>
                                                                <div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Passing Score (%)</label><input type="number" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm" /></div>
                                                            </div>
                                                            <div className="space-y-6">
                                                                <div className="flex justify-between items-center"><h4 className="text-sm font-bold">Questions ({quizForm.questions.length})</h4><button onClick={addQuestion} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">add</span>Add Question</button></div>
                                                                <div className="space-y-4">
                                                                    {quizForm.questions.map((q, qi) => (
                                                                        <div key={qi} className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 relative group/q">
                                                                            <button onClick={() => { const qs = [...quizForm.questions]; qs.splice(qi, 1); setQuizForm({ ...quizForm, questions: qs }); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/q:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xs">close</span></button>
                                                                            <textarea value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} placeholder="Question text..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm mb-4" rows={2} />
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {q.options.map((opt, oi) => (
                                                                                    <div key={oi} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${q.correctAnswer === oi ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800'}`}>
                                                                                        <input type="radio" name={`q-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} className="text-emerald-500 focus:ring-emerald-500" />
                                                                                        <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0" placeholder={`Option ${oi + 1}`} />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3"><button onClick={() => setShowQuizForm(null)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold">Cancel</button><button onClick={() => handleSaveQuiz(showQuizForm.id, showQuizForm.type)} className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20">Save Assessment</button></div>
                                                    </motion.div>
                                                </div>
                                            )}
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
                                                            <option value="STUDENT">Student</option>
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
                                                    <button
                                                        onClick={() => setShowUserForm(true)}
                                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">person_add</span>
                                                        Add Member
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Create User Form */}
                                            {showUserForm && (
                                                <div className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-4 duration-300">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h3 className="text-lg font-bold">Add New Team Member</h3>
                                                        <button onClick={() => setShowUserForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Full Name</label>
                                                            <input
                                                                value={userForm.name}
                                                                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                                                placeholder="e.g. John Doe"
                                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Email Address</label>
                                                            <input
                                                                value={userForm.email}
                                                                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                                                placeholder="email@example.com"
                                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-wider">Password</label>
                                                            <input
                                                                type="password"
                                                                value={userForm.password}
                                                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                                                placeholder="••••••••"
                                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block tracking-wider">System Role</label>
                                                            <select
                                                                value={userForm.role}
                                                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                            >
                                                                <option value="STUDENT">Student</option>
                                                                <option value="ADMIN">Administrator</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                        <button onClick={() => setShowUserForm(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                                        <button
                                                            onClick={handleCreateUser}
                                                            disabled={saving}
                                                            className="px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                                                        >
                                                            {saving ? 'Creating...' : 'Create Member'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

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
                                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                                                                }`}>
                                                                                {u.role === 'STUDENT' ? 'Student' : 'Administrator'}
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
                                    tab === 'results' && stats && (
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
                                            {/* Analytics Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Pass Rate</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">Real-time</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.stats.analytics.passRate}%</h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${stats.stats.analytics.passRate}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Exams Taken</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">Real-time</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.stats.analytics.totalExams}</h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Score</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">Real-time</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                                        {stats.stats.analytics.avgScore}/100
                                                    </h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.stats.analytics.avgScore}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Passed Exams</p>
                                                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">Real-time</span>
                                                    </div>
                                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.stats.analytics.passedExams}</h3>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${stats.stats.analytics.totalExams > 0 ? (stats.stats.analytics.passedExams / stats.stats.analytics.totalExams) * 100 : 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Certificates Tab */}
                                {
                                    tab === 'certificates' && stats && (
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
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</span>
                                                            </div>
                                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.stats.totalUsers}</span>
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
                                                                <th className="px-0 py-4 font-semibold min-w-[200px]" scope="col">Course</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0" scope="col">Date Submitted</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0" scope="col">Status</th>
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
                                                                            CERT-{new Date(c.issuedAt).getFullYear()}-{c.id.substring(0, 4).toUpperCase()}
                                                                        </td>
                                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                                            <div className={`w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                                                                                {initials}
                                                                            </div>
                                                                            <span className="truncate">{c.user?.name || '—'}</span>
                                                                        </td>
                                                                        <td className="px-0 py-4 truncate max-w-xs">{c.course?.title}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(c.issuedAt).toLocaleDateString()}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                                                                c.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                                                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                                                                }`}>
                                                                                {c.status || 'PENDING'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                {c.status === 'PENDING' ? (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={() => handleApproveCertificate(c.id, 'APPROVED')}
                                                                                            className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                                                                        >
                                                                                            Approve
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleApproveCertificate(c.id, 'REJECTED')}
                                                                                            className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg hover:bg-rose-600 transition-colors shadow-sm"
                                                                                        >
                                                                                            Reject
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        {c.status === 'APPROVED' && (
                                                                                            <button
                                                                                                onClick={() => handleRevokeCertificate(c.id)}
                                                                                                className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200 dark:border-red-500/20 text-[10px] font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shadow-sm mr-2"
                                                                                            >
                                                                                                Revoke
                                                                                            </button>
                                                                                        )}
                                                                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="View Details">
                                                                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                                                                        </button>
                                                                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="Download PDF">
                                                                                            <span className="material-symbols-outlined text-lg">download</span>
                                                                                        </button>
                                                                                    </div>
                                                                                )}
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
