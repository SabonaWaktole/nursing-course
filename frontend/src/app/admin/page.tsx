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
import AdminSettingsTab from '@/components/AdminSettingsTab';
import { getFileUrl } from '@/lib/url-utils';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'courses' | 'users' | 'results' | 'certificates' | 'settings'>('overview');
    const [certificates, setCertificates] = useState<any[]>([]);
    const [editingCertId, setEditingCertId] = useState<string | null>(null);
    const [certNumInput, setCertNumInput] = useState('');

    // Course form
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '0', category: 'Nursing', thumbnail: '', tags: [] as string[], instructorId: '' });
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
    const unreadCount = notifications.filter(n => !n.read).length;

    // User management
    const [showUserForm, setShowUserForm] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });

    // Sidebar management
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Drag-and-drop reordering state
    const [dragType, setDragType] = useState<'module' | 'lesson' | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragModuleId, setDragModuleId] = useState<string | null>(null);

    // PDF drag-and-drop across lessons
    const [pdfDragSourceId, setPdfDragSourceId] = useState<string | null>(null);
    const [pdfDragUrl, setPdfDragUrl] = useState<string | null>(null);
    const [pdfDragOverLessonId, setPdfDragOverLessonId] = useState<string | null>(null);
    const [pdfMoveToast, setPdfMoveToast] = useState<string | null>(null);

    // Inline PDF preview state (tracks specific PDF url, not lesson)
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

    // Search & filter state
    const [adminSearch, setAdminSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [courseCategoryFilter, setCourseCategoryFilter] = useState('All');
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [certCourseFilter, setCertCourseFilter] = useState('All');

    // Computed filtered lists
    const filteredCourses = courses.filter((c) => {
        const searchTerm = (tab === 'courses' && adminSearch) ? adminSearch : courseFilter;
        const matchesSearch = !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = courseCategoryFilter === 'All' || c.category === courseCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    const filteredUsers = users.filter((u: any) => {
        const searchTerm = (tab === 'users' && adminSearch) ? adminSearch : userSearch;
        const matchesSearch = !searchTerm || (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = !userRoleFilter || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredCertificates = certificates.filter((c: any) => {
        const searchTerm = (tab === 'certificates' && adminSearch) ? adminSearch : '';
        const matchesCourse = certCourseFilter === 'All' || c.course?.title === certCourseFilter;
        const matchesSearch = !searchTerm || (c.user?.name && c.user.name.toLowerCase().includes(searchTerm.toLowerCase())) || c.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCourse && matchesSearch;
    });

    const uniqueCourseCategories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))] as string[];
    const uniqueCertCourseTitles = ['All', ...Array.from(new Set(certificates.map((c: any) => c.course?.title).filter(Boolean)))] as string[];

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
            const results = await Promise.allSettled([
                api.get('/admin/dashboard'),
                api.get('/courses'),
                api.get('/admin/users'),
                api.get('/quizzes/results/all'),
                api.get('/admin/notifications'),
                api.get('/admin/certificates')
            ]);
            if (results[0].status === 'fulfilled') setStats(results[0].value.data);
            if (results[1].status === 'fulfilled') setCourses(results[1].value.data);
            if (results[2].status === 'fulfilled') setUsers(results[2].value.data);
            if (results[3].status === 'fulfilled') setResults(results[3].value.data);
            if (results[4].status === 'fulfilled') setNotifications(results[4].value.data);
            if (results[5].status === 'fulfilled') setCertificates(results[5].value.data);
            // Log any failed endpoints
            results.forEach((r, i) => {
                if (r.status === 'rejected') console.warn(`Admin endpoint ${i} failed:`, r.reason?.message);
            });
        } catch (error) {
            console.error('Failed to load admin data', error);
        } finally {
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
            setCourseForm({ title: '', description: '', price: '0', category: 'Nursing', thumbnail: '', tags: [], instructorId: '' });
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

    const handleUpdateCertificateNumber = async (certId: string) => {
        try {
            await api.put(`/admin/certificates/${certId}`, { certificateNumber: certNumInput });
            setEditingCertId(null);
            loadCertificates();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error updating certificate number');
        }
    };

    const markRead = async (id: string) => {
        try {
            await api.patch(`/admin/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark notification rad', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all notifications read', err);
        }
    };

    const clearAll = async () => {
        try {
            await api.delete('/admin/notifications');
            setNotifications([]);
            setShowNotifications(false);
        } catch (err) {
            console.error('Failed to clear notifications', err);
        }
    };

    const handleEditCourseInfo = (course: any) => {
        setCourseForm({
            title: course.title,
            description: course.description,
            price: (course.price || 0).toString(),
            category: course.category || 'Nursing',
            thumbnail: course.thumbnail || '',
            tags: course.tags || [],
            instructorId: course.instructor?.id || course.instructorId || ''
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

    // Drag-and-drop reorder handlers
    const handleModuleDragStart = (index: number) => {
        setDragType('module');
        setDragIndex(index);
    };

    const handleModuleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragType === 'module') setDragOverIndex(index);
    };

    const handleModuleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragType !== 'module' || dragIndex === null || dragIndex === dropIndex || !courseDetails) {
            setDragIndex(null); setDragOverIndex(null); setDragType(null);
            return;
        }
        const modules = [...courseDetails.modules];
        const [moved] = modules.splice(dragIndex, 1);
        modules.splice(dropIndex, 0, moved);
        // Optimistic update
        setCourseDetails({ ...courseDetails, modules });
        setDragIndex(null); setDragOverIndex(null); setDragType(null);
        try {
            await api.put(`/courses/${courseDetails.id}/modules/reorder`, { orderedIds: modules.map((m: any) => m.id) });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error reordering modules');
            loadCourseDetail(courseDetails.id);
        }
    };

    const handleLessonDragStart = (moduleId: string, index: number) => {
        setDragType('lesson');
        setDragModuleId(moduleId);
        setDragIndex(index);
    };

    const handleLessonDragOver = (e: React.DragEvent, moduleId: string, index: number) => {
        e.preventDefault();
        if (dragType === 'lesson' && dragModuleId === moduleId) setDragOverIndex(index);
    };

    const handleLessonDrop = async (e: React.DragEvent, moduleId: string, dropIndex: number) => {
        e.preventDefault();
        if (dragType !== 'lesson' || dragModuleId !== moduleId || dragIndex === null || dragIndex === dropIndex || !courseDetails) {
            setDragIndex(null); setDragOverIndex(null); setDragType(null); setDragModuleId(null);
            return;
        }
        const modules = courseDetails.modules.map((mod: any) => {
            if (mod.id !== moduleId) return mod;
            const lessons = [...mod.lessons];
            const [moved] = lessons.splice(dragIndex, 1);
            lessons.splice(dropIndex, 0, moved);
            return { ...mod, lessons };
        });
        setCourseDetails({ ...courseDetails, modules });
        setDragIndex(null); setDragOverIndex(null); setDragType(null); setDragModuleId(null);
        try {
            const targetMod = modules.find((m: any) => m.id === moduleId);
            await api.put(`/courses/modules/${moduleId}/lessons/reorder`, { orderedIds: targetMod.lessons.map((l: any) => l.id) });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error reordering lessons');
            loadCourseDetail(courseDetails.id);
        }
    };

    const handleDragEnd = () => {
        setDragIndex(null); setDragOverIndex(null); setDragType(null); setDragModuleId(null);
        setPdfDragSourceId(null); setPdfDragUrl(null); setPdfDragOverLessonId(null);
    };

    // PDF drag-and-drop handlers
    const handlePdfDragStart = (e: React.DragEvent, lessonId: string, pdfUrl: string) => {
        e.stopPropagation();
        e.dataTransfer.setData('application/pdf-move', JSON.stringify({ sourceLessonId: lessonId, pdfUrl }));
        e.dataTransfer.effectAllowed = 'move';
        setPdfDragSourceId(lessonId);
        setPdfDragUrl(pdfUrl);
        // Prevent lesson reorder drag from firing
        setDragType(null);
    };

    const handlePdfDragOverLesson = (e: React.DragEvent, lessonId: string) => {
        if (!pdfDragSourceId || pdfDragSourceId === lessonId) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setPdfDragOverLessonId(lessonId);
    };

    const handlePdfDragLeaveLesson = (e: React.DragEvent) => {
        e.stopPropagation();
        setPdfDragOverLessonId(null);
    };

    const handlePdfDrop = async (e: React.DragEvent, targetLessonId: string) => {
        e.preventDefault();
        e.stopPropagation();
        let sourceLessonId = '';
        let pdfUrl = '';
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/pdf-move'));
            sourceLessonId = data.sourceLessonId;
            pdfUrl = data.pdfUrl;
        } catch { return; }
        setPdfDragSourceId(null);
        setPdfDragUrl(null);
        setPdfDragOverLessonId(null);

        if (!sourceLessonId || !pdfUrl || sourceLessonId === targetLessonId) return;

        // Optimistic UI update for multi-pdf
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) => {
                    if (l.id === sourceLessonId) {
                        const pdfs = (l.materialUrl || '').split(',').filter(Boolean);
                        const remaining = pdfs.filter((u: string) => u.trim() !== pdfUrl.trim());
                        return { ...l, materialUrl: remaining.length > 0 ? remaining.join(',') : null };
                    }
                    if (l.id === targetLessonId) {
                        const existing = l.materialUrl ? l.materialUrl.split(',').filter(Boolean) : [];
                        existing.push(pdfUrl.trim());
                        return { ...l, materialUrl: existing.join(',') };
                    }
                    return l;
                }),
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }

        try {
            await api.put('/courses/lessons/move-pdf', { sourceLessonId, targetLessonId, pdfUrl });
            setPdfMoveToast('PDF moved successfully!');
            setTimeout(() => setPdfMoveToast(null), 3000);
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error moving PDF');
            if (courseDetails) loadCourseDetail(courseDetails.id);
        }
    };

    // Remove material (video or specific PDF)
    const handleRemoveMaterial = async (lessonId: string, type: 'video' | 'pdf', url?: string) => {
        if (!confirm(`Remove this ${type === 'video' ? 'video' : 'PDF'}?`)) return;

        // Optimistic UI
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) => {
                    if (l.id !== lessonId) return l;
                    if (type === 'video') return { ...l, videoUrl: null };
                    const pdfs = (l.materialUrl || '').split(',').filter(Boolean);
                    const remaining = pdfs.filter((u: string) => u.trim() !== (url || '').trim());
                    return { ...l, materialUrl: remaining.length > 0 ? remaining.join(',') : null };
                }),
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }

        try {
            await api.put(`/courses/lessons/${lessonId}/remove-material`, { type, url });
            setPdfMoveToast(`${type === 'video' ? 'Video' : 'PDF'} removed!`);
            setTimeout(() => setPdfMoveToast(null), 3000);
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error removing material');
            if (courseDetails) loadCourseDetail(courseDetails.id);
        }
    };

    // Reorder a PDF within the same lesson (move up/down)
    const handleReorderPdf = async (lessonId: string, pdfUrl: string, direction: 'up' | 'down') => {
        // Find the lesson across all modules
        const lesson = courseDetails?.modules.flatMap((m: any) => m.lessons).find((l: any) => l.id === lessonId);
        if (!lesson || !lesson.materialUrl) return;

        const pdfs = lesson.materialUrl.split(',').filter(Boolean).map((u: string) => u.trim());
        const idx = pdfs.findIndex((u: string) => u === pdfUrl.trim());
        if (idx < 0) return;

        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= pdfs.length) return;

        // Swap
        [pdfs[idx], pdfs[newIdx]] = [pdfs[newIdx], pdfs[idx]];
        const newMaterialUrl = pdfs.join(',');

        // Optimistic UI
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) => l.id === lessonId ? { ...l, materialUrl: newMaterialUrl } : l),
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }

        try {
            await api.put(`/courses/lessons/${lessonId}/reorder-pdfs`, { orderedUrls: pdfs });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error reordering PDFs');
            if (courseDetails) loadCourseDetail(courseDetails.id);
        }
    };

    const handleSaveQuiz = async (targetId: string, type: 'course' | 'module') => {
        // Validate that all questions have a correct answer selected
        const unansweredOptions = quizForm.questions.findIndex(q => q.correctAnswer === -1);
        if (unansweredOptions !== -1) {
            alert(`Please select a correct answer for question ${unansweredOptions + 1} before saving.`);
            return;
        }

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

    const handleTxtUpload = async (targetId: string, type: 'course' | 'module') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            
            try {
                // Show a loading indicator if desired, or just wait
                const res = await api.post('/quizzes/parse-txt', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const parsedQuestions = res.data.questions.map((q: any) => ({
                    text: q.text,
                    options: q.options,
                    correctAnswer: -1 // Enforce admin to select the answer
                }));

                const noun = type === 'course' ? 'Final Exam' : 'Module Quiz';

                setQuizForm({
                    title: `Imported ${noun}`,
                    passingScore: '70',
                    questions: parsedQuestions
                });
                
                setShowQuizForm({ id: targetId, type, mode: 'create' });

                if (res.data.errors && res.data.errors.length > 0) {
                    alert(`Parsed ${parsedQuestions.length} questions, but with some warnings:\n\n${res.data.errors.join('\n')}`);
                }

            } catch (err: any) {
                alert(err.response?.data?.message || err.response?.data?.errors?.join('\n') || 'Error parsing TXT file');
            }
        };
        input.click();
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
        // Fetch full quiz details to get questions if needed
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
            setShowQuizForm({ id: type === 'course' ? (courseDetails?.id || q.courseId) : (quiz.moduleId || q.moduleId), type, mode: 'edit', quizId: quiz.id });
        });
    };

    const handleCourseQuizClick = async (courseId: string, hasQuiz: boolean) => {
        if (!hasQuiz) {
            setShowQuizForm({ id: courseId, type: 'course', mode: 'create' });
            return;
        }
        try {
            const res = await api.get(`/courses/${courseId}`);
            if (res.data.quizzes && res.data.quizzes.length > 0) {
                openQuizEdit(res.data.quizzes[0], 'course');
            } else {
                setShowQuizForm({ id: courseId, type: 'course', mode: 'create' });
            }
        } catch (err) {
            alert('Failed to load course details for editing exam');
        }
    };

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
                <p className="text-sm font-medium text-slate-500 animate-pulse">Loading dashboard...</p>
            </motion.div>
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

                    {/* Header — Premium glassmorphic design matching global Navbar */}
                    <header className="h-[72px] flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] z-10 shrink-0 transition-all duration-500">
                        <div className="flex-1 flex items-center">
                            {/* Mobile Toggle */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2.5 -ml-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-full transition-all"
                            >
                                <span className="material-symbols-outlined text-2xl">menu</span>
                            </motion.button>

                            {/* Logo glow icon + page title */}
                            <div className="hidden sm:flex items-center gap-3">
                                <motion.div
                                    whileHover={{ rotate: 8, scale: 1.05 }}
                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.1)] dark:shadow-[0_0_12px_rgba(13,185,242,0.2)]"
                                >
                                    <span className="material-symbols-outlined text-primary text-xl">
                                        {tab === 'overview' ? 'grid_view' : tab === 'courses' ? 'menu_book' : tab === 'users' ? 'people_alt' : tab === 'results' ? 'analytics' : tab === 'certificates' ? 'card_membership' : 'settings'}
                                    </span>
                                </motion.div>
                                <div className="hidden lg:block">
                                    <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white capitalize leading-tight">
                                        {tab === 'overview' ? 'Dashboard' : `${tab}`}
                                    </h2>
                                </div>
                            </div>

                            {/* Navigation Links — Spaced edge-to-edge to fill all gaps as requested */}
                            <nav className="hidden xl:flex flex-1 items-center justify-between ml-8 mr-10">
                                {[
                                    { id: 'overview', icon: 'grid_view', label: 'Overview' },
                                    { id: 'courses', icon: 'menu_book', label: 'Courses' },
                                    { id: 'users', icon: 'people_alt', label: 'Users' },
                                    { id: 'results', icon: 'analytics', label: 'Results' },
                                    { id: 'certificates', icon: 'card_membership', label: 'Certs' },
                                ].map((item) => (
                                    <motion.button
                                        key={item.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setTab(item.id as any);
                                            if (item.id === 'users') loadUsers();
                                            if (item.id === 'results') loadResults();
                                            if (item.id === 'certificates') loadCertificates();
                                        }}
                                        className={`group flex items-center gap-1.5 px-3 lg:px-5 py-2 text-[14px] font-bold tracking-tight transition-colors duration-300 relative ${
                                            tab === item.id ? 'text-primary bg-primary/5 rounded-xl border border-primary/20' : 'text-slate-600 dark:text-slate-300 hover:text-primary'
                                        }`}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] transition-all duration-300 ${
                                            tab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                                        }`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </motion.button>
                                ))}
                            </nav>
                        </div>

                            <div className="flex items-center gap-1 sm:gap-2 relative">
                                {/* Notifications Link/Dropdown */}
                                <div className="relative">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                            showNotifications ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/50'
                                        }`}
                                        title="Notifications"
                                    >
                                        <span className="material-symbols-outlined text-xl">notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center animate-pulse">
                                                <span className="text-[7px] font-bold text-white">{unreadCount}</span>
                                            </span>
                                        )}
                                    </motion.button>

                                    <AnimatePresence>
                                        {showNotifications && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 overflow-hidden"
                                            >
                                                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h4>
                                                    {unreadCount > 0 && (
                                                        <button onClick={markAllRead} className="text-xs font-bold text-primary hover:underline">Mark all read</button>
                                                    )}
                                                </div>
                                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                                    {notifications.length > 0 ? (
                                                        <div className="space-y-1 text-left">
                                                            {notifications.map((n) => (
                                                                <div 
                                                                    key={n.id} 
                                                                    className={`p-4 rounded-xl transition-all border ${n.read ? 'bg-transparent border-transparent opacity-60' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60'}`}
                                                                >
                                                                    <div className="flex gap-3">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/20 text-primary'}`}>
                                                                            <span className="material-symbols-outlined text-sm">{n.type === 'enrollment' ? 'person_add' : 'info'}</span>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-tight">{n.message}</p>
                                                                            <p className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                                        </div>
                                                                        {!n.read && (
                                                                            <button onClick={() => markRead(n.id)} className="text-slate-400 hover:text-primary transition-colors">
                                                                                <span className="material-symbols-outlined text-base">check_circle</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-12 text-center">
                                                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-2">notifications_off</span>
                                                            <p className="text-sm text-slate-500">No notifications yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                                                    <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors">Clear All</button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Admin avatar */}
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:flex">
                                    <Link
                                        href="/settings"
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white font-bold flex items-center justify-center shadow-[0_0_12px_rgba(13,185,242,0.3)] border border-primary/20 shrink-0 transition-shadow hover:shadow-[0_0_20px_rgba(13,185,242,0.5)]"
                                        title="Account Settings"
                                    >
                                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                    </Link>
                                </motion.div>
                            </div>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
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
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ duration: 0.4, delay: i * 0.08, ease: [0.25, 0.8, 0.25, 1] }}
                                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                                        className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 dark:hover:border-primary/30 transition-colors shadow-sm dark:shadow-lg hover:shadow-xl hover:shadow-primary/5 group"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                                                            <motion.span
                                                                whileHover={{ rotate: 8, scale: 1.1 }}
                                                                className={`p-2 rounded-lg material-symbols-outlined border ${stat.color} ${stat.bg} ${stat.border} ${stat.shadow}`}
                                                            >
                                                                {stat.icon}
                                                            </motion.span>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</h3>
                                                                <p className={`${stat.trendColor} text-xs font-semibold mt-2 flex items-center gap-1`}>
                                                                    <span className="material-symbols-outlined text-sm">{stat.trendIcon}</span> {stat.trend}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Upload Resources Quick Action */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.35 }}
                                                    className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg flex flex-col items-center justify-center text-center"
                                                >
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
                                                </motion.div>

                                                {/* Recent Activity */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.45 }}
                                                    className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg"
                                                >
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
                                                                <motion.div
                                                                    key={e.id}
                                                                    initial={{ opacity: 0, x: -12 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                                                                    className="flex gap-4"
                                                                >
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
                                                                </motion.div>
                                                            );
                                                        })}
                                                        {(!stats || stats.recentEnrollments.length === 0) && (
                                                            <p className="text-sm text-slate-500">No recent enrollments available.</p>
                                                        )}
                                                    </div>
                                                    <button className="w-full mt-8 py-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        View All Log
                                                    </button>
                                                </motion.div>
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
                                                        <input value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 w-64 transition-all" placeholder="Filter courses..." type="text" />
                                                    </div>
                                                    <select value={courseCategoryFilter} onChange={(e) => setCourseCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 transition-all">
                                                        {uniqueCourseCategories.map(cat => (
                                                            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setEditingCourse(null);
                                                        setCourseForm({ title: '', description: '', price: '0', category: 'Nursing', thumbnail: '', tags: [], instructorId: '' });
                                                        setShowCourseForm(!showCourseForm);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20"
                                                >
                                                    <span className="material-symbols-outlined text-lg">add</span>
                                                    Add New Course
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                            {showCourseForm && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                    transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
                                                    className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-slate-800/50 p-6 shadow-sm overflow-hidden"
                                                >
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
                                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Assigned Instructor</label>
                                                            <div className="relative">
                                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">person</span>
                                                                <select
                                                                    value={courseForm.instructorId}
                                                                    onChange={(e) => setCourseForm({ ...courseForm, instructorId: e.target.value })}
                                                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                                                                >
                                                                    <option value="">Unassigned (All Admins)</option>
                                                                    {users.filter((u: any) => u.role === 'ADMIN').map((admin: any) => (
                                                                        <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                                                                    ))}
                                                                </select>
                                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 mt-1">Certificates and notifications will be routed to the assigned instructor. Leave unassigned for all admins.</p>
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
                                                </motion.div>
                                            )}
                                            </AnimatePresence>

                                            <div className="mt-8 grid grid-cols-1 gap-6">
                                                {filteredCourses.map((course) => (
                                                    <motion.div
                                                        key={course.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500 group overflow-hidden"
                                                    >
                                                        <div className="p-6 md:p-8 relative">
                                                            {/* Background hover gradient */}
                                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem]"></div>
                                                            
                                                            <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start relative z-10">
                                                                {/* Premium 16:9 Thumbnail */}
                                                                <div className="w-full xl:w-72 2xl:w-80 shrink-0 aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-md group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50">
                                                                    {course.thumbnail ? (
                                                                        <img src={getFileUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex flex-col items-center justify-center text-primary/40 bg-primary/5">
                                                                            <span className="material-symbols-outlined text-5xl mb-2">school</span>
                                                                            <span className="text-xs font-bold uppercase tracking-widest">No Image</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                                                        <span className="backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                                            {course.category}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Content Details */}
                                                                <div className="min-w-0 flex-1 flex flex-col self-stretch">
                                                                    <div className="mb-4">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            {((course as any).tags || []).slice(0, 3).map((t: string) => (
                                                                                <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-1">{course.title}</h3>
                                                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 max-w-3xl">{course.description}</p>
                                                                    </div>

                                                                    <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                                        {/* Advanced Stats Row */}
                                                                        <div className="flex items-center gap-6 xl:gap-8">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                                                                                    <span className="material-symbols-outlined text-lg">groups</span>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Students</p>
                                                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{course._count?.enrollments || 0}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center border border-purple-100 dark:border-purple-800/30">
                                                                                    <span className="material-symbols-outlined text-lg">view_module</span>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Modules</p>
                                                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{course._count?.modules || 0}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                                                                            <div className="hidden sm:flex items-center gap-3">
                                                                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
                                                                                    <span className="material-symbols-outlined text-lg">payments</span>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price</p>
                                                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">${Number(course.price).toFixed(2)}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Premium Action Bar */}
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex items-center bg-slate-50 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
                                                                                <button onClick={() => handleEditCourseInfo(course)} className="p-2.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md" title="Edit Info">
                                                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (expandedCourse !== course.id) {
                                                                                            setExpandedCourse(course.id);
                                                                                            loadCourseDetail(course.id);
                                                                                        }
                                                                                        setShowModuleForm(showModuleForm === course.id ? null : course.id);
                                                                                    }}
                                                                                    className="p-2.5 rounded-lg text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
                                                                                    title="Add Module"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-lg">create_new_folder</span>
                                                                                </button>
                                                                                <button onClick={() => handleCourseQuizClick(course.id, course._count?.quizzes > 0)} className="p-2.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md" title={course._count?.quizzes > 0 ? "Edit Final Exam" : "Add Final Exam"}>
                                                                                    <span className="material-symbols-outlined text-lg">quiz</span>
                                                                                </button>
                                                                                <button onClick={() => handleDeleteCourse(course.id)} className="p-2.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md" title="Delete Course">
                                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                                </button>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (expandedCourse === course.id) { setExpandedCourse(null); setCourseDetails(null); }
                                                                                    else { setExpandedCourse(course.id); loadCourseDetail(course.id); }
                                                                                }}
                                                                                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${expandedCourse === course.id ? 'bg-primary border-primary text-white shadow-primary/30 hover:bg-primary/90' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary hover:shadow-md'}`}
                                                                            >
                                                                                <span className="material-symbols-outlined text-lg">{expandedCourse === course.id ? 'expand_less' : 'stream'}</span>
                                                                                <span className="hidden sm:inline">{expandedCourse === course.id ? 'Close' : 'Manage Content'}</span>
                                                                            </button>
                                                                        </div>
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
                                                                                <div
                                                                                    key={mod.id}
                                                                                    draggable
                                                                                    onDragStart={() => handleModuleDragStart(mi)}
                                                                                    onDragOver={(e) => handleModuleDragOver(e, mi)}
                                                                                    onDrop={(e) => handleModuleDrop(e, mi)}
                                                                                    onDragEnd={handleDragEnd}
                                                                                    className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 ${
                                                                                        dragType === 'module' && dragOverIndex === mi
                                                                                            ? 'border-primary ring-2 ring-primary/20 scale-[1.01]'
                                                                                            : 'border-slate-200 dark:border-slate-800'
                                                                                    }`}
                                                                                >
                                                                                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <span className="material-symbols-outlined text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing text-lg" title="Drag to reorder">drag_indicator</span>
                                                                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{mi + 1}</span>
                                                                                            <h4 className="text-sm font-bold">{mod.title}</h4>
                                                                                        </div>
                                                                                        <div className="flex gap-1">
                                                                                            <button onClick={() => setShowLessonForm(showLessonForm === mod.id ? null : mod.id)} className="p-1 hover:text-primary transition-colors" title="Add Lesson"><span className="material-symbols-outlined text-lg">add_circle</span></button>
                                                                                            <button onClick={() => handleTxtUpload(mod.id, 'module')} className="p-1 hover:text-sky-500 transition-colors" title="Upload Quiz (TXT)"><span className="material-symbols-outlined text-lg">upload_file</span></button>
                                                                                            <button onClick={() => {
                                                                                                if (mod.quizzes && mod.quizzes.length > 0) {
                                                                                                    openQuizEdit(mod.quizzes[0], 'module');
                                                                                                } else {
                                                                                                    setShowQuizForm({ id: mod.id, type: 'module', mode: 'create' });
                                                                                                }
                                                                                            }} className="p-1 hover:text-emerald-500 transition-colors" title="Create Quiz Manually"><span className="material-symbols-outlined text-lg">quiz</span></button>
                                                                                            <button onClick={() => handleDeleteModule(mod.id, course.id)} className="p-1 hover:text-red-500 transition-colors" title="Delete Module"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="p-3 space-y-2">
                                                                                        {mod.lessons?.map((lesson: any, li: number) => (
                                                                                            <div
                                                                                                key={lesson.id}
                                                                                                draggable={!pdfDragSourceId}
                                                                                                onDragStart={(e) => { if (pdfDragSourceId) { e.preventDefault(); return; } e.stopPropagation(); handleLessonDragStart(mod.id, li); }}
                                                                                                onDragOver={(e) => {
                                                                                                    if (pdfDragSourceId) { handlePdfDragOverLesson(e, lesson.id); return; }
                                                                                                    e.stopPropagation(); handleLessonDragOver(e, mod.id, li);
                                                                                                }}
                                                                                                onDragLeave={(e) => { if (pdfDragSourceId) handlePdfDragLeaveLesson(e); }}
                                                                                                onDrop={(e) => {
                                                                                                    if (pdfDragSourceId) { handlePdfDrop(e, lesson.id); return; }
                                                                                                    e.stopPropagation(); handleLessonDrop(e, mod.id, li);
                                                                                                }}
                                                                                                onDragEnd={handleDragEnd}
                                                                                                className={`rounded-xl group/lesson transition-all duration-300 shadow-sm border overflow-hidden ${
                                                                                                    pdfDragOverLessonId === lesson.id && pdfDragSourceId !== lesson.id
                                                                                                        ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-400/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] scale-[1.01]'
                                                                                                        : pdfDragSourceId === lesson.id
                                                                                                            ? 'border-sky-300 bg-sky-50/50 dark:bg-sky-900/10 opacity-60 scale-[0.98]'
                                                                                                            : dragType === 'lesson' && dragModuleId === mod.id && dragOverIndex === li
                                                                                                                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                                                                                : 'bg-slate-50 dark:bg-slate-950/50 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800'
                                                                                                }`}
                                                                                            >
                                                                                                <div className="flex justify-between items-center p-2">
                                                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                                                        <span className="material-symbols-outlined text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing text-sm shrink-0" title="Drag to reorder">drag_indicator</span>
                                                                                                        <span className={`material-symbols-outlined text-sm shrink-0 ${lesson.videoUrl ? 'text-emerald-500' : lesson.materialUrl ? 'text-sky-500' : 'text-slate-400'}`}>{lesson.videoUrl ? 'videocam' : lesson.materialUrl ? 'picture_as_pdf' : 'play_circle'}</span>
                                                                                                        <div className="flex flex-col min-w-0">
                                                                                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{lesson.title}</span>
                                                                                                            <div className="flex gap-2 items-center flex-wrap">
                                                                                                                {/* Video badge with delete */}
                                                                                                                {lesson.videoUrl && (
                                                                                                                    <span className="text-[9px] font-black uppercase text-emerald-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group/vid">
                                                                                                                        <span className="material-symbols-outlined text-[10px]">videocam</span>
                                                                                                                        <span>Video</span>
                                                                                                                        <button
                                                                                                                            onClick={(e) => { e.stopPropagation(); handleRemoveMaterial(lesson.id, 'video'); }}
                                                                                                                            className="ml-0.5 opacity-0 group-hover/vid:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                                                                                                            title="Remove video"
                                                                                                                        >
                                                                                                                            <span className="material-symbols-outlined text-[10px]">close</span>
                                                                                                                        </button>
                                                                                                                    </span>
                                                                                                                )}
                                                                                                                {/* Multiple PDF badges with drag + delete + reorder */}
                                                                                                                {lesson.materialUrl && (() => {
                                                                                                                    const pdfList = lesson.materialUrl.split(',').filter(Boolean);
                                                                                                                    return pdfList.map((pdfUrl: string, pi: number) => (
                                                                                                                    <span
                                                                                                                        key={pi}
                                                                                                                        draggable
                                                                                                                        onDragStart={(e) => handlePdfDragStart(e, lesson.id, pdfUrl.trim())}
                                                                                                                        className="text-[9px] font-black uppercase text-sky-500 flex items-center gap-0.5 cursor-grab active:cursor-grabbing hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 px-1.5 py-0.5 rounded-md border border-transparent hover:border-sky-200 dark:hover:border-sky-800 transition-all select-none group/pdf"
                                                                                                                        title="Drag this PDF to move it to another lesson"
                                                                                                                    >
                                                                                                                        <span className="material-symbols-outlined text-[10px]">description</span>
                                                                                                                        <span className="max-w-[60px] truncate">{pdfUrl.trim().split('/').pop() || `PDF ${pi + 1}`}</span>
                                                                                                                        <span className="material-symbols-outlined text-[8px] ml-0.5 opacity-60">drag_indicator</span>
                                                                                                                        {/* Reorder arrows (only when multiple PDFs) */}
                                                                                                                        {pdfList.length > 1 && (
                                                                                                                            <span className="opacity-0 group-hover/pdf:opacity-100 flex items-center ml-0.5 transition-all">
                                                                                                                                {pi > 0 && (
                                                                                                                                    <button
                                                                                                                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleReorderPdf(lesson.id, pdfUrl.trim(), 'up'); }}
                                                                                                                                        className="text-sky-400 hover:text-sky-600 transition-colors"
                                                                                                                                        title="Move up"
                                                                                                                                    >
                                                                                                                                        <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                                                                                                                                    </button>
                                                                                                                                )}
                                                                                                                                {pi < pdfList.length - 1 && (
                                                                                                                                    <button
                                                                                                                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleReorderPdf(lesson.id, pdfUrl.trim(), 'down'); }}
                                                                                                                                        className="text-sky-400 hover:text-sky-600 transition-colors"
                                                                                                                                        title="Move down"
                                                                                                                                    >
                                                                                                                                        <span className="material-symbols-outlined text-[10px]">arrow_downward</span>
                                                                                                                                    </button>
                                                                                                                                )}
                                                                                                                            </span>
                                                                                                                        )}
                                                                                                                        <button
                                                                                                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveMaterial(lesson.id, 'pdf', pdfUrl.trim()); }}
                                                                                                                            className="ml-0.5 opacity-0 group-hover/pdf:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                                                                                                            title="Remove this PDF"
                                                                                                                        >
                                                                                                                            <span className="material-symbols-outlined text-[10px]">close</span>
                                                                                                                        </button>
                                                                                                                    </span>
                                                                                                                    ));
                                                                                                                })()}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                                                        {lesson.materialUrl && lesson.materialUrl.split(',').some((u: string) => u.trim().toLowerCase().endsWith('.pdf')) && (
                                                                                                            <button
                                                                                                                onClick={(e) => {
                                                                                                                    e.stopPropagation();
                                                                                                                    const firstPdf = lesson.materialUrl.split(',').find((u: string) => u.trim().toLowerCase().endsWith('.pdf'))?.trim();
                                                                                                                    if (firstPdf) setPreviewPdfUrl(previewPdfUrl === firstPdf ? null : firstPdf);
                                                                                                                }}
                                                                                                                className={`p-1 rounded-md transition-all ${previewPdfUrl && lesson.materialUrl?.includes(previewPdfUrl) ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'text-slate-400 hover:text-sky-500 opacity-0 group-hover/lesson:opacity-100'}`}
                                                                                                                title="Preview PDFs"
                                                                                                            >
                                                                                                                <span className="material-symbols-outlined text-sm">{previewPdfUrl && lesson.materialUrl?.includes(previewPdfUrl) ? 'visibility_off' : 'visibility'}</span>
                                                                                                            </button>
                                                                                                        )}
                                                                                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="opacity-0 group-hover/lesson:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Inline PDF Previews — stacked for each PDF */}
                                                                                                {lesson.materialUrl && lesson.materialUrl.split(',').filter(Boolean).map((pUrl: string, pi: number) => {
                                                                                                    const trimUrl = pUrl.trim();
                                                                                                    if (!trimUrl.toLowerCase().endsWith('.pdf')) return null;
                                                                                                    if (previewPdfUrl !== trimUrl) return null;
                                                                                                    return (
                                                                                                        <motion.div
                                                                                                            key={pi}
                                                                                                            initial={{ height: 0, opacity: 0 }}
                                                                                                            animate={{ height: 320, opacity: 1 }}
                                                                                                            exit={{ height: 0, opacity: 0 }}
                                                                                                            transition={{ duration: 0.35, ease: [0.25, 0.8, 0.25, 1] }}
                                                                                                            className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative"
                                                                                                        >
                                                                                                            <iframe
                                                                                                                src={getFileUrl(trimUrl)}
                                                                                                                className="w-full h-full border-none"
                                                                                                                title={`PDF Preview - ${lesson.title} (${pi + 1})`}
                                                                                                            />
                                                                                                            <div className="absolute bottom-2 right-2 flex items-center gap-1">
                                                                                                                <a href={getFileUrl(trimUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-900/70 backdrop-blur-sm text-white rounded-lg hover:bg-slate-900/90 transition-colors" title="Open in new tab">
                                                                                                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                                                                                </a>
                                                                                                                <a href={getFileUrl(trimUrl)} download className="p-1.5 bg-slate-900/70 backdrop-blur-sm text-white rounded-lg hover:bg-slate-900/90 transition-colors" title="Download">
                                                                                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                                                                                </a>
                                                                                                            </div>
                                                                                                        </motion.div>
                                                                                                    );
                                                                                                })}

                                                                                                {/* PDF Drop Zone Indicator */}
                                                                                                {pdfDragSourceId && pdfDragSourceId !== lesson.id && pdfDragOverLessonId === lesson.id && (
                                                                                                    <div className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border-t border-sky-200 dark:border-sky-800 flex items-center gap-2 text-sky-600 dark:text-sky-400 animate-pulse">
                                                                                                        <span className="material-symbols-outlined text-sm">file_download</span>
                                                                                                        <span className="text-[10px] font-bold uppercase tracking-wider">Drop PDF here</span>
                                                                                                    </div>
                                                                                                )}
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
                                                                        <div className="pt-2 flex gap-2">
                                                                            <button onClick={() => handleCourseQuizClick(courseDetails?.id, courseDetails?.quizzes && courseDetails.quizzes.length > 0)} className="flex items-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 px-4 py-2 text-xs font-bold hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30">
                                                                                <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                                                                {courseDetails?.quizzes && courseDetails.quizzes.length > 0 ? 'Edit Final Exam' : 'Add Final Exam'}
                                                                            </button>
                                                                            <button onClick={() => handleTxtUpload(courseDetails?.id, 'course')} className="flex items-center gap-2 rounded-xl bg-sky-50 text-sky-600 px-4 py-2 text-xs font-bold hover:bg-sky-100 transition-colors dark:bg-sky-900/20 dark:hover:bg-sky-900/30">
                                                                                <span className="material-symbols-outlined text-sm">upload_file</span>
                                                                                Upload Final Exam (TXT)
                                                                            </button>
                                                                        </div>
                                                                        {courseDetails?.quizzes?.length > 0 && (
                                                                            <div className="mt-4 p-4 bg-emerald-500/5 rounded-2xl border-2 border-emerald-500/10 flex justify-between items-center">
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
                                                                        <div key={qi} className={`p-5 rounded-2xl border relative group/q transition-colors ${
                                                                            q.correctAnswer === -1 
                                                                                ? 'bg-red-50/50 dark:bg-red-900/10 border-red-300 dark:border-red-800' 
                                                                                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800'
                                                                        }`}>
                                                                            <button onClick={() => { const qs = [...quizForm.questions]; qs.splice(qi, 1); setQuizForm({ ...quizForm, questions: qs }); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/q:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xs">close</span></button>
                                                                            <textarea value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} placeholder="Question text..." className={`w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-3 text-sm mb-4 ${q.correctAnswer === -1 ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-700'}`} rows={2} />
                                                                            {q.correctAnswer === -1 && (
                                                                                <p className="text-xs font-bold text-red-500 mb-3 flex items-center gap-1">
                                                                                    <span className="material-symbols-outlined text-sm">warning</span>
                                                                                    Please select the correct answer
                                                                                </p>
                                                                            )}
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {q.options.map((opt, oi) => (
                                                                                    <div key={oi} className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${q.correctAnswer === oi ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`} onClick={() => updateQuestion(qi, 'correctAnswer', oi)}>
                                                                                        <input type="radio" name={`q-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} className="text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                                                                                        <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} onClick={(e) => e.stopPropagation()} className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0" placeholder={`Option ${oi + 1}`} />
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
                                                        <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-slate-900 dark:text-slate-200 transition-all shadow-sm" placeholder="Search users..." type="text" />
                                                    </div>
                                                    <div className="relative w-full sm:w-48">
                                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">filter_list</span>
                                                        <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="pl-10 pr-8 py-2.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-slate-900 dark:text-slate-200 transition-all shadow-sm appearance-none">
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
                                                            {filteredUsers.map((u: any, idx: number) => {
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
                                                        Showing <span className="font-medium text-slate-900 dark:text-white">{filteredUsers.length}</span> of {users.length} user{users.length !== 1 ? 's' : ''}
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
                                                {[
                                                    { label: 'Avg. Pass Rate', value: `${stats.stats.analytics.passRate}%`, barColor: 'bg-primary', barWidth: stats.stats.analytics.passRate },
                                                    { label: 'Total Exams Taken', value: stats.stats.analytics.totalExams, barColor: 'bg-blue-400', barWidth: 100 },
                                                    { label: 'Average Score', value: `${stats.stats.analytics.avgScore}/100`, barColor: 'bg-purple-500', barWidth: stats.stats.analytics.avgScore },
                                                    { label: 'Passed Exams', value: stats.stats.analytics.passedExams, barColor: 'bg-amber-500', barWidth: stats.stats.analytics.totalExams > 0 ? (stats.stats.analytics.passedExams / stats.stats.analytics.totalExams) * 100 : 0 },
                                                ].map((card, ci) => (
                                                    <motion.div
                                                        key={ci}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: ci * 0.08, duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                                                        whileHover={{ y: -3 }}
                                                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                                                            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium">Real-time</span>
                                                        </div>
                                                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${card.barWidth}%` }}
                                                                transition={{ delay: 0.3 + ci * 0.1, duration: 0.8, ease: 'easeOut' }}
                                                                className={`${card.barColor} h-1.5 rounded-full`}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))}
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
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.05, duration: 0.4 }}
                                                        whileHover={{ y: -3 }}
                                                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 hover:shadow-lg transition-all"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Issued</span>
                                                            </div>
                                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{certificates.length}</span>
                                                        </div>
                                                    </motion.div>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.12, duration: 0.4 }}
                                                        whileHover={{ y: -3 }}
                                                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center group hover:border-amber-500/30 hover:shadow-lg transition-all"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                                    <span className="material-symbols-outlined text-sm">school</span>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Students</span>
                                                            </div>
                                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.stats.totalUsers}</span>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 16 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2, duration: 0.4 }}
                                                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center"
                                                >
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Quick Verification</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter certificate ID to verify authenticity instantly.</p>
                                                    <div className="flex gap-2">
                                                        <input className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 transition-colors" placeholder="Cert ID (e.g. CERT-123)" type="text" />
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center"
                                                        >
                                                            <span className="material-symbols-outlined">search</span>
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            </div>

                                            {/* Certificates Table */}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Issued Certificates Log</h3>
                                                    <div className="flex gap-3">
                                                        <div className="relative">
                                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">filter_list</span>
                                                            <select value={certCourseFilter} onChange={(e) => setCertCourseFilter(e.target.value)} className="pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary focus:border-primary block cursor-pointer transition-colors">
                                                                {uniqueCertCourseTitles.map(t => (
                                                                    <option key={t} value={t}>{t === 'All' ? 'All Courses' : t}</option>
                                                                ))}
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
                                                                <th className="px-6 py-4 font-semibold" scope="col">Certificate No.</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0" scope="col">Date Submitted</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0" scope="col">Status</th>
                                                                <th className="px-6 py-4 font-semibold shrink-0 text-right" scope="col">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                            {filteredCertificates.map((c: any, idx: number) => {
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
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            {editingCertId === c.id ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <input 
                                                                                        type="text" 
                                                                                        value={certNumInput} 
                                                                                        onChange={(e) => setCertNumInput(e.target.value)} 
                                                                                        className="w-24 px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white dark:bg-slate-800"
                                                                                        placeholder="Cert No."
                                                                                    />
                                                                                    <button onClick={() => handleUpdateCertificateNumber(c.id)} className="text-emerald-500 hover:text-emerald-700">
                                                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                                                    </button>
                                                                                    <button onClick={() => setEditingCertId(null)} className="text-slate-400 hover:text-slate-600">
                                                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-2 group/edit">
                                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                                        {c.certificateNumber || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                                                                                    </span>
                                                                                    <button 
                                                                                        onClick={() => { setEditingCertId(c.id); setCertNumInput(c.certificateNumber || ''); }}
                                                                                        className="opacity-0 group-hover/edit:opacity-100 text-primary hover:text-primary/80 transition-opacity"
                                                                                    >
                                                                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </td>
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
                                                                                {!c.status || c.status === 'PENDING' ? (
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
                                                                                        {c.status === 'REJECTED' && (
                                                                                            <button
                                                                                                onClick={() => handleApproveCertificate(c.id, 'APPROVED')}
                                                                                                className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors shadow-sm mr-2"
                                                                                            >
                                                                                                Re-Approve
                                                                                            </button>
                                                                                        )}
                                                                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="View Details">
                                                                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                window.open(`${getFileUrl(`/api/public/certificates/${c.uniqueId}/download`)}`, '_blank');
                                                                                            }}
                                                                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="Download PDF"
                                                                                        >
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
                                                        Showing <span className="font-medium text-slate-900 dark:text-white">{filteredCertificates.length}</span> of {certificates.length} entries
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Settings Tab */}
                                {
                                    tab === 'settings' && (
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth max-w-5xl mx-auto">
                                            <AdminSettingsTab />
                                        </div>
                                    )
                                }
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </motion.div>

                {/* PDF Move Toast */}
                <AnimatePresence>
                    {pdfMoveToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-white/10 dark:border-slate-200"
                        >
                            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">check_circle</span>
                            <span className="text-sm font-bold">{pdfMoveToast}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
        </RoleGuard>
    );
}
