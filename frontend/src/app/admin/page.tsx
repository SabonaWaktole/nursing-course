'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { invalidate } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DashboardStats, Course } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import AdminSettingsTab from '@/components/AdminSettingsTab';
import UserDropdown from '@/components/UserDropdown';
import NotificationBell from '@/components/NotificationBell';
import { getFileUrl } from '@/lib/url-utils';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'overview' | 'courses' | 'users' | 'results' | 'certificates' | 'settings' | 'guide'>('overview');
    const [certificates, setCertificates] = useState<any[]>([]);
    const [editingCertId, setEditingCertId] = useState<string | null>(null);
    const [certNumInput, setCertNumInput] = useState('');

    // Course form
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '0', credit: '0', category: '', thumbnail: '', tags: [] as string[], instructorId: '', siteNumber: 1 });
    const [editingCourse, setEditingCourse] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Module form
    const [showModuleForm, setShowModuleForm] = useState<string | null>(null);
    const [moduleTitle, setModuleTitle] = useState('');

    // Lesson form — needs moduleId
    const [showLessonForm, setShowLessonForm] = useState<string | null>(null); // moduleId
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', youtubeUrl: '', materialUrl: '' });
    const [uploading, setUploading] = useState<{ video?: boolean; material?: boolean }>({});
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Folder Upload Form
    const folderInputRef = useRef<HTMLInputElement>(null);
    const [showFolderPreview, setShowFolderPreview] = useState(false);
    const [folderFiles, setFolderFiles] = useState<File[]>([]);
    const [folderCourseTitle, setFolderCourseTitle] = useState('');
    const [folderSiteNumber, setFolderSiteNumber] = useState(1);
    const [isFolderUploading, setIsFolderUploading] = useState(false);


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


    const notifications: any[] = [];
    const setNotifications = (n: any) => {};
    const setShowNotifications = (s: boolean) => {};
    const unreadCount = 0;

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

    // Material drag-and-drop across lessons (video, youtube, pdf)
    const [materialDrag, setMaterialDrag] = useState<{ lessonId: string, type: 'video' | 'youtube' | 'pdf', url: string } | null>(null);
    const [materialDragOverLessonId, setMaterialDragOverLessonId] = useState<string | null>(null);
    const [materialDragOverZone, setMaterialDragOverZone] = useState<'top' | 'bottom' | null>(null);
    const [materialMoveToast, setMaterialMoveToast] = useState<string | null>(null);

    // Inline PDF preview state (tracks specific PDF url, not lesson)
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

    // Inline editing state for module/lesson names
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editingModuleTitle, setEditingModuleTitle] = useState('');
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [editingLessonTitle, setEditingLessonTitle] = useState('');

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
        // Admin loads the full course view, so description is present here — optional
        // chaining only satisfies the shared Course type, which the lighter public
        // listing also uses.
        const matchesSearch = !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
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
        // Called on mount and after every course/module/lesson/quiz mutation. Dropping
        // the cached public reads here means the admin never sees a stale list, and the
        // /courses page picks up the change on its next visit rather than after the TTL.
        // These requests intentionally go through `api` directly, never the cache.
        invalidate('/courses');
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
            setCourseForm({ title: '', description: '', price: '0', credit: '0', category: '', thumbnail: '', tags: [], instructorId: '', siteNumber: 1 });
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


    const handleEditCourseInfo = (course: any) => {
        setCourseForm({
            title: course.title,
            description: course.description,
            price: (course.price || 0).toString(),
            credit: (course.credit !== undefined && course.credit !== null ? course.credit : 0).toString(),
            category: course.category || '',
            thumbnail: course.thumbnail || '',
            tags: course.tags || [],
            instructorId: course.instructor?.id || course.instructorId || '',
            siteNumber: course.siteNumber || 1
        });
        setEditingCourse(course.id);
        setShowCourseForm(true);
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

    const handleRenameModule = async (moduleId: string, courseId: string) => {
        const newTitle = editingModuleTitle.trim();
        if (!newTitle) { setEditingModuleId(null); return; }
        // Optimistic UI
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) =>
                mod.id === moduleId ? { ...mod, title: newTitle } : mod
            );
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }
        setEditingModuleId(null);
        try {
            await api.put(`/courses/modules/${moduleId}`, { title: newTitle });
            loadCourseDetail(courseId);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error renaming module');
            loadCourseDetail(courseId);
        }
    };

    const handleRenameLesson = async (lessonId: string) => {
        const newTitle = editingLessonTitle.trim();
        if (!newTitle) { setEditingLessonId(null); return; }
        // Optimistic UI
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) =>
                    l.id === lessonId ? { ...l, title: newTitle } : l
                ),
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }
        setEditingLessonId(null);
        try {
            await api.put(`/courses/lessons/${lessonId}`, { title: newTitle });
            if (courseDetails) loadCourseDetail(courseDetails.id);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error renaming lesson');
            if (courseDetails) loadCourseDetail(courseDetails.id);
        }
    };

    const handleAddLesson = async (moduleId: string) => {
        try {
            await api.post(`/courses/modules/${moduleId}/lessons`, lessonForm);
            setLessonForm({ title: '', description: '', videoUrl: '', youtubeUrl: '', materialUrl: '' });
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
        if (dragType === 'lesson') setDragOverIndex(index);
    };

    const handleLessonDrop = async (e: React.DragEvent, moduleId: string, dropIndex: number) => {
        e.preventDefault();
        if (dragType !== 'lesson' || dragIndex === null || dragModuleId === null || !courseDetails) {
            setDragIndex(null); setDragOverIndex(null); setDragType(null); setDragModuleId(null);
            return;
        }

        // Intra-module drag
        if (dragModuleId === moduleId) {
            if (dragIndex === dropIndex) {
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
        } else {
            // Cross-module drag
            let movedLesson: any = null;
            const modules = courseDetails.modules.map((mod: any) => {
                if (mod.id === dragModuleId) {
                    const lessons = [...mod.lessons];
                    movedLesson = lessons.splice(dragIndex, 1)[0];
                    return { ...mod, lessons };
                }
                return mod;
            });
            if (!movedLesson) return;

            const finalModules = modules.map((mod: any) => {
                if (mod.id === moduleId) {
                    const lessons = [...mod.lessons];
                    lessons.splice(dropIndex, 0, movedLesson);
                    return { ...mod, lessons };
                }
                return mod;
            });

            setCourseDetails({ ...courseDetails, modules: finalModules });
            setDragIndex(null); setDragOverIndex(null); setDragType(null); setDragModuleId(null);

            try {
                // 1. Change the module of the lesson
                await api.put(`/courses/lessons/${movedLesson.id}`, { moduleId });
                // 2. Reorder the target module
                const targetMod = finalModules.find((m: any) => m.id === moduleId);
                await api.put(`/courses/modules/${moduleId}/lessons/reorder`, { orderedIds: targetMod.lessons.map((l: any) => l.id) });
                // 3. Reorder the source module
                const sourceMod = finalModules.find((m: any) => m.id === dragModuleId);
                await api.put(`/courses/modules/${dragModuleId}/lessons/reorder`, { orderedIds: sourceMod.lessons.map((l: any) => l.id) });
            } catch (err: any) {
                alert(err.response?.data?.message || 'Error moving lesson between modules');
                loadCourseDetail(courseDetails.id);
            }
        }
    };

    const handleDragEnd = () => {
        setDragIndex(null); setDragOverIndex(null); setDragType(null); setDragModuleId(null);
        setMaterialDrag(null); setMaterialDragOverLessonId(null); setMaterialDragOverZone(null);
    };

    // PDF drag-and-drop handlers
    const handleMaterialDragStart = (e: React.DragEvent, lessonId: string, type: 'video' | 'youtube' | 'pdf', url: string) => {
        e.stopPropagation();
        e.dataTransfer.setData('application/material-move', JSON.stringify({ sourceLessonId: lessonId, type, url }));
        e.dataTransfer.effectAllowed = 'move';
        setMaterialDrag({ lessonId, type, url });
        setDragType(null); // Prevent lesson reorder drag
    };

    const handleMaterialDragOverLesson = (e: React.DragEvent, lessonId: string) => {
        if (!materialDrag) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setMaterialDragOverLessonId(lessonId);

        // If dragging within the same lesson, detect left vs right half for intra-lesson ordering
        if (materialDrag.lessonId === lessonId) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) {
                setMaterialDragOverZone('top');
            } else {
                setMaterialDragOverZone('bottom');
            }
        }
    };

    const handleMaterialDragLeaveLesson = (e: React.DragEvent) => {
        e.stopPropagation();
        setMaterialDragOverLessonId(null);
        setMaterialDragOverZone(null);
    };

    const handleMaterialDrop = async (e: React.DragEvent, targetLessonId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        let sourceLessonId = '';
        let type: 'video' | 'youtube' | 'pdf' = 'pdf';
        let url = '';
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/material-move'));
            sourceLessonId = data.sourceLessonId;
            type = data.type;
            url = data.url;
        } catch { return; }

        const zone = materialDragOverZone;
        
        setMaterialDrag(null);
        setMaterialDragOverLessonId(null);
        setMaterialDragOverZone(null);

        if (!sourceLessonId || !url || !courseDetails) return;

        // Intra-lesson ordering 
        if (sourceLessonId === targetLessonId) {
            let targetLesson: any = null;
            courseDetails.modules.forEach((mod: any) => {
                const found = mod.lessons.find((l: any) => l.id === targetLessonId);
                if (found) targetLesson = found;
            });
            
            if (!targetLesson) return;
            
            let newVideoFirst = targetLesson.videoFirst; // default to current
            
            if (type === 'video' || type === 'youtube') {
                // If dragging video/youtube, 'top' means left -> video first
                newVideoFirst = zone === 'top';
            } else if (type === 'pdf') {
                // If dragging a PDF, 'top' means left -> PDF first (so videoFirst = false)
                newVideoFirst = zone !== 'top';
            }
            
            // Optimistic UI
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) => l.id === targetLessonId ? { ...l, videoFirst: newVideoFirst } : l)
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });

            try {
                await api.put(`/courses/lessons/${targetLessonId}`, { videoFirst: newVideoFirst });
            } catch (err: any) {
                alert('Error updating order');
                loadCourseDetail(courseDetails.id);
            }
            return;
        }

        // Cross-lesson move
        // Optimistic UI
        const updatedModules = courseDetails.modules.map((mod: any) => ({
            ...mod,
            lessons: mod.lessons.map((l: any) => {
                let updatedL = { ...l };
                
                if (l.id === sourceLessonId) {
                    if (type === 'pdf') {
                        const pdfs = (l.materialUrl || '').split(',').filter(Boolean);
                        const remaining = pdfs.filter((u: string) => u.trim() !== url.trim());
                        updatedL.materialUrl = remaining.length > 0 ? remaining.join(',') : null;
                    } else if (type === 'video') {
                        updatedL.videoUrl = null; // will be swapped below if target has one
                    } else if (type === 'youtube') {
                        updatedL.youtubeUrl = null;
                    }
                }
                
                if (l.id === targetLessonId) {
                    if (type === 'pdf') {
                        const existing = l.materialUrl ? l.materialUrl.split(',').filter(Boolean) : [];
                        existing.push(url.trim());
                        updatedL.materialUrl = existing.join(',');
                    } else if (type === 'video') {
                        // Swap logic for optimistic UI
                        const sourceLessonObj = courseDetails.modules.flatMap((m: any) => m.lessons).find((ll: any) => ll.id === sourceLessonId);
                        if (sourceLessonObj) {
                            updatedL.videoUrl = sourceLessonObj.videoUrl;
                            // Target's old video goes to source
                            if (l.id === sourceLessonId) {
                                updatedL.videoUrl = l.videoUrl; // Actually we handle source above, this gets complex for UI, backend will handle swap safely
                            }
                        }
                    } else if (type === 'youtube') {
                        const sourceLessonObj = courseDetails.modules.flatMap((m: any) => m.lessons).find((ll: any) => ll.id === sourceLessonId);
                        if (sourceLessonObj) {
                            updatedL.youtubeUrl = sourceLessonObj.youtubeUrl;
                        }
                    }
                }
                return updatedL;
            }),
        }));
        
        // For video/youtube swap, just rely on backend reload for exact correctness if target had a video, 
        // otherwise optimistic works fine for empty targets.
        setCourseDetails({ ...courseDetails, modules: updatedModules });

        try {
            await api.put('/courses/lessons/move-material', { sourceLessonId, targetLessonId, type, url });
            setMaterialMoveToast('Material moved successfully!');
            setTimeout(() => setMaterialMoveToast(null), 3000);
            loadCourseDetail(courseDetails.id); // Reload to ensure swap correctness
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error moving material');
            loadCourseDetail(courseDetails.id);
        }
    };

    // Remove material (video, youtube, or specific PDF)
    const handleRemoveMaterial = async (lessonId: string, type: 'video' | 'pdf' | 'youtube', url?: string) => {
        if (!confirm(`Remove this ${type === 'video' ? 'video' : type === 'youtube' ? 'YouTube link' : 'PDF'}?`)) return;

        // Optimistic UI
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) => {
                    if (l.id !== lessonId) return l;
                    if (type === 'video') return { ...l, videoUrl: null };
                    if (type === 'youtube') return { ...l, youtubeUrl: null };
                    const pdfs = (l.materialUrl || '').split(',').filter(Boolean);
                    const remaining = pdfs.filter((u: string) => u.trim() !== (url || '').trim());
                    return { ...l, materialUrl: remaining.length > 0 ? remaining.join(',') : null };
                }),
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }

        try {
            await api.put(`/courses/lessons/${lessonId}/remove-material`, { type, url });
            setMaterialMoveToast(`${type === 'video' ? 'Video' : type === 'youtube' ? 'YouTube link' : 'PDF'} removed!`);
            setTimeout(() => setMaterialMoveToast(null), 3000);
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

    const handleToggleVideoFirst = async (lesson: any, newValue: boolean) => {
        // Optimistic UI
        if (courseDetails) {
            const updatedModules = courseDetails.modules.map((mod: any) => ({
                ...mod,
                lessons: mod.lessons.map((l: any) => l.id === lesson.id ? { ...l, videoFirst: newValue } : l),
            }));
            setCourseDetails({ ...courseDetails, modules: updatedModules });
        }

        try {
            await api.put(`/courses/lessons/${lesson.id}`, { videoFirst: newValue });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error updating order');
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
                    correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : -1
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
        input.accept = type === 'video' ? '.mp4,.webm,.mov' : '.pdf,.txt,.doc,.docx,.zip';
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

    // Folder Upload Handlers
    const handleFolderSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Auto-detect course title from the first file's relative path (the top folder name)
        // webkitRelativePath looks like "Course Name/01_lesson.txt"
        let detectedTitle = 'New Bulk Course';
        if (files[0].webkitRelativePath) {
            const parts = files[0].webkitRelativePath.split('/');
            if (parts.length > 0) {
                // Replace underscores with spaces
                detectedTitle = parts[0].replace(/_/g, ' ');
            }
        }

        setFolderFiles(files);
        setFolderCourseTitle(detectedTitle);
        setFolderSiteNumber(1);
        setShowFolderPreview(true);
        // Reset input so the same folder can be selected again if needed
        if (folderInputRef.current) folderInputRef.current.value = '';
    };

    const handleFolderUpload = async () => {
        if (folderFiles.length === 0) return;
        setIsFolderUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('courseTitle', folderCourseTitle);
        formData.append('siteNumber', folderSiteNumber.toString());

        folderFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await api.post('/upload/course-folder', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            });
            alert(`Success! ${res.data.message}.`);
            setShowFolderPreview(false);
            setFolderFiles([]);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Upload failed');
        } finally {
            setIsFolderUploading(false);
            setUploadProgress(null);
        }
    };

    const handleLessonUpload = async (type: 'video' | 'material') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'video' ? '.mp4,.webm,.mov' : '.pdf,.txt,.doc,.docx,.zip';
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
            const qs = prev.questions.map((q, i) => 
                i === index ? { ...q, [field]: value } : q
            );
            return { ...prev, questions: qs };
        });
    };

    const updateOption = (qi: number, oi: number, value: string) => {
        setQuizForm((prev) => {
            const qs = prev.questions.map((q, i) => {
                if (i === qi) {
                    const newOptions = [...q.options];
                    newOptions[oi] = value;
                    return { ...q, options: newOptions };
                }
                return q;
            });
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

    const renderCourseFormUI = (isInline = false) => (
        <div className={`relative w-full ${isInline ? 'bg-transparent' : 'max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800'} overflow-hidden flex flex-col max-h-full`}>
            <div className={`flex justify-between items-center p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 ${isInline ? 'rounded-t-[2rem]' : ''}`}>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">{editingCourse ? 'edit' : 'add_circle'}</span>
                    {editingCourse ? 'Edit Course Details' : 'Create New Course'}
                </h3>
                {!isInline && (
                    <button onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                )}
            </div>
            <div className={`p-5 sm:p-6 space-y-5 ${isInline ? '' : 'overflow-y-auto custom-scrollbar max-h-[60vh]'} flex-1`}>
                <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Course Title</label>
                    <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="E.g., CNA Basics 101" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Category</label>
                        <select value={courseForm.category || ''} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                            <option value="">No Category</option>
                            <option value="Nursing">Nursing</option>
                            <option value="CNA Prep">CNA Prep</option>
                            <option value="Clinical Skills">Clinical Skills</option>
                            <option value="Certification">Certification</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Price ($)</label>
                        <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} placeholder="E.g., 49.99" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Credit (e.g. 1.5)</label>
                        <input type="number" step="0.1" value={courseForm.credit} onChange={(e) => setCourseForm({ ...courseForm, credit: e.target.value })} placeholder="E.g., 1.5" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Assigned Instructor</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">person</span>
                            <select
                                value={courseForm.instructorId}
                                onChange={(e) => setCourseForm({ ...courseForm, instructorId: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                            >
                                <option value="">Unassigned (All Admins)</option>
                                {users.filter((u: any) => u.role === 'ADMIN').map((admin: any) => (
                                    <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">expand_more</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">Certificates and notifications will be routed to the assigned instructor. Leave unassigned for all admins.</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Site Number</label>
                        <select
                            value={courseForm.siteNumber}
                            onChange={(e) => setCourseForm({ ...courseForm, siteNumber: parseInt(e.target.value) })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        >
                            <option value={1}>Site 1 (Main)</option>
                            <option value={2}>Site 2</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1.5">Select which website this course belongs to.</p>
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${courseForm.tags.includes(t)
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-primary/50'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Description</label>
                    <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description and learning objectives..." className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" rows={3} />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Course Thumbnail</label>
                    <div className="flex border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                        {courseForm.thumbnail ? (
                            <div className="h-24 w-36 shrink-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center border-r border-slate-300 dark:border-slate-700 relative group overflow-hidden">
                                <img src={getFileUrl(courseForm.thumbnail)} alt="Preview" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-24 w-36 shrink-0 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-xs text-slate-400 border-r border-slate-300 dark:border-slate-700 border-dashed">
                                <span className="material-symbols-outlined text-2xl mb-1 opacity-50">add_photo_alternate</span>
                                No Image
                            </div>
                        )}
                        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center p-4 justify-between gap-3">
                            <div className="text-sm text-slate-500 mr-4 leading-snug">
                                {courseForm.thumbnail ? 'Thumbnail uploaded successfully. You can replace it if needed.' : 'Upload a high-quality thumbnail (16:9 recommended) to make your course stand out.'}
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
                                className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full sm:w-auto px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-all shadow-sm"
                                disabled={saving}
                            >
                                <span className="material-symbols-outlined text-lg">upload</span>
                                {courseForm.thumbnail ? 'Replace' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`flex justify-end gap-3 p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 ${isInline ? 'rounded-b-[2rem]' : ''}`}>
                <button onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={handleCreateCourse} disabled={saving} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-sky-500 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center gap-2">
                    {saving ? <span className="material-symbols-outlined animate-spin text-lg">refresh</span> : null}
                    {saving ? 'Saving...' : (editingCourse ? 'Save Changes' : 'Create Course')}
                </button>
            </div>
        </div>
    );

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

                    {/* Header — Horizontal Tab Navigation */}
                    <header className="h-[76px] flex items-center justify-between px-6 lg:px-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 relative shrink-0 transition-all duration-300">
                        {/* Mobile Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2.5 mr-4 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                        >
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </motion.button>

                        <div className="flex flex-1 items-center gap-12 h-full">
                            {/* Page Title (Large) - Fixed width to prevent nav shifting */}
                            <div className="hidden lg:flex items-center w-[220px] shrink-0">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white capitalize truncate">
                                    {tab === 'overview' ? 'Dashboard' : `${tab}`}
                                </h1>
                            </div>

                            {/* Horizontal Tabs Navigation */}
                            <nav className="hidden md:flex items-end h-full pt-4">
                                {[
                                    { id: 'overview', icon: 'grid_view', label: 'Overview' },
                                    { id: 'courses', icon: 'menu_book', label: 'Courses' },
                                    { id: 'users', icon: 'person_outline', label: 'Users' },
                                    { id: 'results', icon: 'bar_chart', label: 'Results' },
                                    { id: 'certificates', icon: 'workspace_premium', label: 'Certs' },
                                ].map((item) => {
                                    const isActive = tab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setTab(item.id as any);
                                                if (item.id === 'users') loadUsers();
                                                if (item.id === 'results') loadResults();
                                                if (item.id === 'certificates') loadCertificates();
                                            }}
                                            className={`group flex items-center gap-2 px-5 pb-5 pt-2 text-[15px] font-semibold transition-all duration-200 border-b-2 ${
                                                isActive 
                                                    ? 'text-blue-700 dark:text-blue-500 border-blue-700 dark:border-blue-500' 
                                                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-[20px] mb-[1px]">
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right Section: Notification & User Dropdown */}
                        <div className="flex items-center gap-6 relative ml-6">
                            <NotificationBell />
                            <UserDropdown />
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
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <input 
                                                        type="file" 
                                                        // @ts-ignore - webkitdirectory is non-standard but widely supported
                                                        webkitdirectory="" 
                                                        directory="" 
                                                        multiple 
                                                        ref={folderInputRef}
                                                        onChange={handleFolderSelection}
                                                        className="hidden" 
                                                    />
                                                    <button
                                                        onClick={() => folderInputRef.current?.click()}
                                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">folder_zip</span>
                                                        <span>Upload Course Folder</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCourse(null);
                                                            setCourseForm({ title: '', description: '', price: '0', category: '', thumbnail: '', tags: [], instructorId: '', credit: '0', siteNumber: 1 });
                                                            setShowCourseForm(!showCourseForm);
                                                        }}
                                                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 w-full sm:w-auto overflow-hidden relative group"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 translate-x-[-150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                                                        <span className="material-symbols-outlined text-xl relative z-10">add_circle</span>
                                                        <span className="relative z-10">Add New Course</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                            {showCourseForm && !editingCourse && (
                                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-full"
                                                >
                                                    {renderCourseFormUI(false)}
                                                </motion.div>
                                                </div>
                                            )}
                                            
                                            {showFolderPreview && (
                                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[85vh]"
                                                    >
                                                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-primary">folder_zip</span>
                                                                Bulk Import Course
                                                            </h3>
                                                        </div>
                                                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Course Title</label>
                                                                <input 
                                                                    value={folderCourseTitle} 
                                                                    onChange={(e) => setFolderCourseTitle(e.target.value)} 
                                                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Site Number</label>
                                                                <select
                                                                    value={folderSiteNumber}
                                                                    onChange={(e) => setFolderSiteNumber(parseInt(e.target.value))}
                                                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                                                >
                                                                    <option value={1}>Site 1 (Main)</option>
                                                                    <option value={2}>Site 2</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                                                                    Files to process ({folderFiles.length})
                                                                </label>
                                                                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-sm max-h-48 overflow-y-auto custom-scrollbar">
                                                                    {folderFiles.map((file, i) => {
                                                                        const isLinkFile = file.name.toLowerCase().includes('link');
                                                                        const isActualVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
                                                                        const isYoutubeLink = file.name.toLowerCase().includes('video') && !isActualVideo;
                                                                        return (
                                                                            <div key={i} className={`flex items-center gap-2 py-1 ${isLinkFile ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                                <span className="material-symbols-outlined text-[16px]">{isLinkFile ? 'block' : isYoutubeLink ? 'smart_display' : isActualVideo ? 'videocam' : 'draft'}</span>
                                                                                <span className="truncate">{file.webkitRelativePath || file.name}</span>
                                                                                {isYoutubeLink && <span className="text-xs text-red-500 ml-auto bg-red-100 dark:bg-red-900/30 px-2 rounded-full">YouTube Link</span>}
                                                                                {isActualVideo && <span className="text-xs text-emerald-500 ml-auto bg-emerald-100 dark:bg-emerald-900/30 px-2 rounded-full">Video File</span>}
                                                                                {isLinkFile && <span className="text-xs text-rose-500 ml-auto bg-rose-100 dark:bg-rose-900/30 px-2 rounded-full">Ignored</span>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <p className="text-xs text-slate-500 mt-2">
                                                                    Files with &quot;video&quot; in the name (any format) will be scanned for embedded YouTube URLs. Actual video files (.mp4, .webm, .mov) will be uploaded directly. Files containing &quot;link&quot; will be ignored. Other files will be uploaded as materials.
                                                                </p>
                                                            </div>
                                                            
                                                            {uploadProgress !== null && (
                                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2">
                                                                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
                                                            <button 
                                                                onClick={() => { setShowFolderPreview(false); setFolderFiles([]); }} 
                                                                className="px-6 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-sm"
                                                                disabled={isFolderUploading}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={handleFolderUpload} 
                                                                disabled={isFolderUploading}
                                                                className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                                                            >
                                                                {isFolderUploading ? `Uploading ${uploadProgress || 0}%...` : 'Confirm & Upload'}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            )}
                                            </AnimatePresence>

                                            <div className="mt-8 grid grid-cols-1 gap-6">
                                                {filteredCourses.map((course) => editingCourse === course.id ? (
                                                    <motion.div
                                                        key={`edit-${course.id}`}
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-primary/40 shadow-2xl transition-all duration-500 overflow-hidden"
                                                    >
                                                        {renderCourseFormUI(true)}
                                                    </motion.div>
                                                ) : (
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
                                                                        {course.category && (
                                                                            <span className="backdrop-blur-md bg-white/20 dark:bg-black/40 border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                                                {course.category}
                                                                            </span>
                                                                        )}
                                                                        <span className="backdrop-blur-md bg-primary/20 dark:bg-primary/40 border border-primary/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                                            Site {course.siteNumber || 1}
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

                                                                    <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 lg:gap-6">
                                                                        {/* Advanced Stats Row */}
                                                                        <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap">
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
                                                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">${formatPrice(Number(course.price))}</p>
                                                                                </div>
                                                                            </div>
                                                                            {(course.credit ?? 0) > 0 && (
                                                                                <>
                                                                                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                                                                                    <div className="hidden sm:flex items-center gap-3">
                                                                                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-800/30">
                                                                                            <span className="material-symbols-outlined text-lg">stars</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Credit</p>
                                                                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200">{course.credit ?? 0}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {/* Premium Responsive Action Bar */}
                                                                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-start lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
                                                                            <div className="flex w-full sm:w-auto sm:flex-none items-center justify-evenly bg-white dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm backdrop-blur-md relative overflow-hidden group">
                                                                                <button onClick={() => handleEditCourseInfo(course)} className="p-2.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all w-full sm:w-auto flex justify-center hover:scale-105 active:scale-95" title="Edit Info">
                                                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (expandedCourse !== course.id) {
                                                                                            setExpandedCourse(course.id);
                                                                                            loadCourseDetail(course.id);
                                                                                        }
                                                                                        setShowModuleForm(showModuleForm === course.id ? null : course.id);
                                                                                    }}
                                                                                    className="p-2.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all w-full sm:w-auto flex justify-center hover:scale-105 active:scale-95"
                                                                                    title="Add Module"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[20px]">create_new_folder</span>
                                                                                </button>
                                                                                <button onClick={() => handleCourseQuizClick(course.id, course._count?.quizzes > 0)} className="p-2.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all w-full sm:w-auto flex justify-center hover:scale-105 active:scale-95" title={course._count?.quizzes > 0 ? "Edit Final Exam" : "Add Final Exam"}>
                                                                                    <span className="material-symbols-outlined text-[20px]">quiz</span>
                                                                                </button>
                                                                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                                                                                <button onClick={() => handleDeleteCourse(course.id)} className="p-2.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all w-full sm:w-auto flex justify-center hover:scale-105 active:scale-95" title="Delete Course">
                                                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                                                </button>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (expandedCourse === course.id) { setExpandedCourse(null); setCourseDetails(null); }
                                                                                    else { setExpandedCourse(course.id); loadCourseDetail(course.id); }
                                                                                }}
                                                                                className={`relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border w-full sm:w-auto group ${expandedCourse === course.id ? 'bg-gradient-to-r from-primary to-cyan-500 border-transparent text-white shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5' : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary backdrop-blur-md hover:-translate-y-0.5'}`}
                                                                            >
                                                                                {expandedCourse !== course.id && (
                                                                                    <div className="absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-in-out"></div>
                                                                                )}
                                                                                <span className="material-symbols-outlined text-[20px] relative z-10">{expandedCourse === course.id ? 'expand_less' : 'stream'}</span>
                                                                                <span className="relative z-10">{expandedCourse === course.id ? 'Close' : 'Manage Content'}</span>
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
                                                                                            {editingModuleId === mod.id ? (
                                                                                                <form onSubmit={(e) => { e.preventDefault(); handleRenameModule(mod.id, course.id); }} className="flex items-center gap-1 flex-1 min-w-0">
                                                                                                    <input
                                                                                                        autoFocus
                                                                                                        value={editingModuleTitle}
                                                                                                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                                                                                                        onBlur={() => handleRenameModule(mod.id, course.id)}
                                                                                                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingModuleId(null); }}
                                                                                                        className="text-sm font-bold bg-white dark:bg-slate-900 border border-primary/40 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-primary/30 w-full min-w-0 transition-all"
                                                                                                    />
                                                                                                </form>
                                                                                            ) : (
                                                                                                <h4 className="text-sm font-bold cursor-pointer hover:text-primary transition-colors" onDoubleClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }}>{mod.title}</h4>
                                                                                            )}
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
                                                                                            <button onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }} className="p-1 hover:text-amber-500 transition-colors" title="Rename Module"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                                                            <button onClick={() => handleDeleteModule(mod.id, course.id)} className="p-1 hover:text-red-500 transition-colors" title="Delete Module"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="p-3 space-y-2">
                                                                                        {mod.lessons?.map((lesson: any, li: number) => (
                                                                                            <div
                                                                                                key={lesson.id}
                                                                                                draggable={!materialDrag}
                                                                                                onDragStart={(e) => { if (materialDrag) { e.preventDefault(); return; } e.stopPropagation(); handleLessonDragStart(mod.id, li); }}
                                                                                                onDragOver={(e) => {
                                                                                                    if (materialDrag) { handleMaterialDragOverLesson(e, lesson.id); return; }
                                                                                                    e.stopPropagation(); handleLessonDragOver(e, mod.id, li);
                                                                                                }}
                                                                                                onDragLeave={(e) => { if (materialDrag) handleMaterialDragLeaveLesson(e); }}
                                                                                                onDrop={(e) => {
                                                                                                    if (materialDrag) { handleMaterialDrop(e, lesson.id); return; }
                                                                                                    e.stopPropagation(); handleLessonDrop(e, mod.id, li);
                                                                                                }}
                                                                                                onDragEnd={handleDragEnd}
                                                                                                className={`rounded-xl group/lesson transition-all duration-300 shadow-sm border overflow-hidden relative ${
                                                                                                    materialDragOverLessonId === lesson.id && materialDrag?.lessonId !== lesson.id
                                                                                                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-400/30 shadow-[0_0_20px_rgba(52,211,153,0.15)] scale-[1.01]'
                                                                                                        : materialDrag?.lessonId === lesson.id
                                                                                                            ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10 opacity-60 scale-[0.98]'
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
                                                                                                            {editingLessonId === lesson.id ? (
                                                                                                                <form onSubmit={(e) => { e.preventDefault(); handleRenameLesson(lesson.id); }} className="flex items-center min-w-0 w-full">
                                                                                                                    <input
                                                                                                                        autoFocus
                                                                                                                        value={editingLessonTitle}
                                                                                                                        onChange={(e) => setEditingLessonTitle(e.target.value)}
                                                                                                                        onBlur={() => handleRenameLesson(lesson.id)}
                                                                                                                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingLessonId(null); }}
                                                                                                                        className="text-[11px] font-bold bg-white dark:bg-slate-900 border border-primary/40 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-primary/30 w-full min-w-0 transition-all"
                                                                                                                    />
                                                                                                                </form>
                                                                                                            ) : (
                                                                                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate cursor-pointer hover:text-primary transition-colors" onDoubleClick={() => { setEditingLessonId(lesson.id); setEditingLessonTitle(lesson.title); }}>{lesson.title}</span>
                                                                                                            )}
                                                                                                            <div className="flex gap-2 items-center flex-wrap">
                                                                                                                {/* Render either Video or PDFs first based on lesson.videoFirst */}
                                                                                                                {(() => {
                                                                                                                    const renderVideoBadge = () => lesson.videoUrl && (
                                                                                                                        <div 
                                                                                                                            className={`text-[9px] font-black uppercase text-emerald-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border transition-all select-none group/video ${
                                                                                                                                materialDrag?.lessonId === lesson.id && materialDrag?.type === 'video' ? 'opacity-50 border-emerald-200 border-dashed' : 'border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 cursor-grab active:cursor-grabbing hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                                                                                                                            }`}
                                                                                                                            draggable
                                                                                                                            onDragStart={(e) => handleMaterialDragStart(e, lesson.id, 'video', lesson.videoUrl)}
                                                                                                                        >
                                                                                                                            <span className="material-symbols-outlined text-[11px]">videocam</span>
                                                                                                                            <span>Video</span>
                                                                                                                            {/* Swap arrows for video to toggle with PDFs */}
                                                                                                                            {lesson.materialUrl && (
                                                                                                                                <span className="opacity-0 group-hover/video:opacity-100 flex items-center ml-0.5 transition-all">
                                                                                                                                    {!lesson.videoFirst && (
                                                                                                                                        <button
                                                                                                                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleVideoFirst(lesson, true); }}
                                                                                                                                            className="text-emerald-400 hover:text-emerald-600 transition-colors"
                                                                                                                                            title="Show Video First"
                                                                                                                                        >
                                                                                                                                            <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                                                                                                                                        </button>
                                                                                                                                    )}
                                                                                                                                    {lesson.videoFirst && (
                                                                                                                                        <button
                                                                                                                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleVideoFirst(lesson, false); }}
                                                                                                                                            className="text-emerald-400 hover:text-emerald-600 transition-colors"
                                                                                                                                            title="Show PDF First"
                                                                                                                                        >
                                                                                                                                            <span className="material-symbols-outlined text-[10px]">arrow_downward</span>
                                                                                                                                        </button>
                                                                                                                                    )}
                                                                                                                                </span>
                                                                                                                            )}
                                                                                                                            <button
                                                                                                                                onClick={(e) => { e.stopPropagation(); handleRemoveMaterial(lesson.id, 'video'); }}
                                                                                                                                className="ml-0.5 opacity-0 group-hover/video:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                                                                                                                title="Remove video"
                                                                                                                            >
                                                                                                                                <span className="material-symbols-outlined text-[10px]">close</span>
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    );

                                                                                                                    const renderYoutubeBadge = () => lesson.youtubeUrl && (
                                                                                                                        <div 
                                                                                                                            className={`text-[9px] font-black uppercase text-red-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border transition-all select-none group/yt ${
                                                                                                                                materialDrag?.lessonId === lesson.id && materialDrag?.type === 'youtube' ? 'opacity-50 border-red-200 border-dashed' : 'border-transparent hover:border-red-200 dark:hover:border-red-800 cursor-grab active:cursor-grabbing hover:bg-red-50 dark:hover:bg-red-900/30'
                                                                                                                            }`}
                                                                                                                            draggable
                                                                                                                            onDragStart={(e) => handleMaterialDragStart(e, lesson.id, 'youtube', lesson.youtubeUrl)}
                                                                                                                        >
                                                                                                                            <span className="material-symbols-outlined text-[11px]">play_circle</span>
                                                                                                                            <span>YouTube</span>
                                                                                                                            <button
                                                                                                                                onClick={(e) => { e.stopPropagation(); handleRemoveMaterial(lesson.id, 'youtube'); }}
                                                                                                                                className="ml-0.5 opacity-0 group-hover/yt:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                                                                                                                title="Remove YouTube URL"
                                                                                                                            >
                                                                                                                                <span className="material-symbols-outlined text-[10px]">close</span>
                                                                                                                            </button>
                                                                                                                        </div>
                                                                                                                    );

                                                                                                                    const renderPdfBadges = () => lesson.materialUrl && (() => {
                                                                                                                        const pdfList = lesson.materialUrl.split(',').filter(Boolean);
                                                                                                                        return pdfList.map((pdfUrl: string, pi: number) => (
                                                                                                                        <span
                                                                                                                            key={pi}
                                                                                                                            draggable
                                                                                                                            onDragStart={(e) => handleMaterialDragStart(e, lesson.id, 'pdf', pdfUrl.trim())}
                                                                                                                            className={`text-[9px] font-black uppercase text-sky-500 flex items-center gap-0.5 cursor-grab active:cursor-grabbing hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 px-1.5 py-0.5 rounded-md border transition-all select-none group/pdf ${
                                                                                                                                materialDrag?.lessonId === lesson.id && materialDrag?.type === 'pdf' && materialDrag?.url === pdfUrl.trim() ? 'opacity-50 border-sky-200 border-dashed' : 'border-transparent hover:border-sky-200 dark:hover:border-sky-800'
                                                                                                                            }`}
                                                                                                                            title="Drag this PDF to move it"
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
                                                                                                                            {lesson.videoUrl && pi === 0 && lesson.videoFirst && (
                                                                                                                               <span className="opacity-0 group-hover/pdf:opacity-100 flex items-center ml-0.5 transition-all">
                                                                                                                                  <button
                                                                                                                                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleVideoFirst(lesson, false); }}
                                                                                                                                      className="text-sky-400 hover:text-sky-600 transition-colors"
                                                                                                                                      title="Move Above Video"
                                                                                                                                  >
                                                                                                                                      <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                                                                                                                                  </button>
                                                                                                                               </span>
                                                                                                                            )}
                                                                                                                            {lesson.videoUrl && pi === pdfList.length - 1 && !lesson.videoFirst && (
                                                                                                                                <span className="opacity-0 group-hover/pdf:opacity-100 flex items-center ml-0.5 transition-all">
                                                                                                                                  <button
                                                                                                                                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleToggleVideoFirst(lesson, true); }}
                                                                                                                                      className="text-sky-400 hover:text-sky-600 transition-colors"
                                                                                                                                      title="Move Below Video"
                                                                                                                                  >
                                                                                                                                      <span className="material-symbols-outlined text-[10px]">arrow_downward</span>
                                                                                                                                  </button>
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
                                                                                                                    })();

                                                                                                                    return (
                                                                                                                        <>
                                                                                                                            {/* Intra-lesson drop zone top */}
                                                                                                                            {materialDrag?.lessonId === lesson.id && materialDragOverZone === 'top' && (
                                                                                                                                <div className="w-[2px] h-4 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-pulse mr-1" />
                                                                                                                            )}
                                                                                                                            {lesson.videoFirst ? (
                                                                                                                                <>
                                                                                                                                    {renderVideoBadge()}
                                                                                                                                    {renderYoutubeBadge()}
                                                                                                                                    {renderPdfBadges()}
                                                                                                                                </>
                                                                                                                            ) : (
                                                                                                                                <>
                                                                                                                                    {renderPdfBadges()}
                                                                                                                                    {renderVideoBadge()}
                                                                                                                                    {renderYoutubeBadge()}
                                                                                                                                </>
                                                                                                                            )}
                                                                                                                            {/* Intra-lesson drop zone bottom */}
                                                                                                                            {materialDrag?.lessonId === lesson.id && materialDragOverZone === 'bottom' && (
                                                                                                                                <div className="w-[2px] h-4 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-pulse ml-1" />
                                                                                                                            )}
                                                                                                                        </>
                                                                                                                    );
                                                                                                                })()}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                                                        {lesson.materialUrl && lesson.materialUrl.split(',').some((u: string) => u.trim().toLowerCase().endsWith('.pdf') || u.trim().toLowerCase().endsWith('.txt')) && (
                                                                                                            <button
                                                                                                                onClick={(e) => {
                                                                                                                    e.stopPropagation();
                                                                                                                    const firstPdf = lesson.materialUrl.split(',').find((u: string) => u.trim().toLowerCase().endsWith('.pdf') || u.trim().toLowerCase().endsWith('.txt'))?.trim();
                                                                                                                    if (firstPdf) setPreviewPdfUrl(previewPdfUrl === firstPdf ? null : firstPdf);
                                                                                                                }}
                                                                                                                className={`p-1 rounded-md transition-all ${previewPdfUrl && lesson.materialUrl?.includes(previewPdfUrl) ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'text-slate-400 hover:text-sky-500 opacity-0 group-hover/lesson:opacity-100'}`}
                                                                                                                title="Preview PDF/TXT"
                                                                                                            >
                                                                                                                <span className="material-symbols-outlined text-sm">{previewPdfUrl && lesson.materialUrl?.includes(previewPdfUrl) ? 'visibility_off' : 'visibility'}</span>
                                                                                                            </button>
                                                                                                        )}
                                                                                                        <button onClick={() => { setEditingLessonId(lesson.id); setEditingLessonTitle(lesson.title); }} className="opacity-0 group-hover/lesson:opacity-100 p-1 text-slate-400 hover:text-amber-500 transition-opacity" title="Rename Lesson"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                                                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="opacity-0 group-hover/lesson:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"><span className="material-symbols-outlined text-sm">delete</span></button>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Inline PDF Previews — stacked for each PDF */}
                                                                                                {lesson.materialUrl && lesson.materialUrl.split(',').filter(Boolean).map((pUrl: string, pi: number) => {
                                                                                                    const trimUrl = pUrl.trim();
                                                                                                    if (!trimUrl.toLowerCase().endsWith('.pdf') && !trimUrl.toLowerCase().endsWith('.txt')) return null;
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
                                                                                                {materialDrag && materialDrag.lessonId !== lesson.id && materialDragOverLessonId === lesson.id && (
                                                                                                    <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-pulse">
                                                                                                        <span className="material-symbols-outlined text-sm">move_down</span>
                                                                                                        <span className="text-xs font-semibold">Drop material here</span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                        {mod.quizzes?.map((quiz: any) => (
                                                                                            <div key={quiz.id} className="flex justify-between items-center p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                                                                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500 text-sm">task_alt</span><span className="text-xs font-bold text-emerald-600">Quiz: {quiz.title}</span></div>
                                                                                                <div className="flex items-center gap-1">
                                                                                                    <button onClick={() => openQuizEdit(quiz, 'module')} className="p-1 text-emerald-400 hover:text-emerald-600" title="Edit Quiz"><span className="material-symbols-outlined text-sm">edit</span></button>
                                                                                                    <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-1 text-emerald-400 hover:text-red-500" title="Delete Quiz"><span className="material-symbols-outlined text-sm">close</span></button>
                                                                                                </div>
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
                                                                                                    
                                                                                                    <div>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            placeholder="Optional: External Video URL (e.g. YouTube)"
                                                                                                            value={lessonForm.youtubeUrl || ''}
                                                                                                            onChange={(e) => setLessonForm({ ...lessonForm, youtubeUrl: e.target.value })}
                                                                                                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
                                                                                                        />
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
                                                                                        <button 
                                                                                            onClick={() => window.open(`/certificate/verify/${c.uniqueId}`, '_blank')}
                                                                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-primary transition-colors" title="View Details"
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                window.open(`${getFileUrl(`/api/certificates/download/${c.id}`)}`, '_blank');
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

                                {/* Guide Tab */}
                                {
                                    tab === 'guide' && (
                                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth max-w-5xl mx-auto">
                                            <GuideTab />
                                        </div>
                                    )
                                }
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </motion.div>

                {/* Material Move Toast */}
                <AnimatePresence>
                    {materialMoveToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-white/10 dark:border-slate-200"
                        >
                            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">check_circle</span>
                            <span className="text-sm font-bold">{materialMoveToast}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
        </RoleGuard>
    );
}

/* ═══════════════════════════════════════════
   GUIDE TAB COMPONENT
   ═══════════════════════════════════════════ */

function GuideTab() {
    const [images, setImages] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editForm, setEditForm] = React.useState({ title: '', description: '' });
    const [dragIdx, setDragIdx] = React.useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const loadImages = async () => {
        // Re-run after every guide mutation, so drop the public cached copy too.
        invalidate('/guide');
        try {
            const res = await api.get('/guide');
            setImages(res.data);
        } catch (err) {
            console.error('Failed to load guide images:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { loadImages(); }, []);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setUploadProgress(0);
        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append('image', files[i]);
                formData.append('title', `Step ${images.length + i + 1}`);
                formData.append('description', '');
                await api.post('/guide', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const total = progressEvent.total || 1;
                        const currentFileProgress = progressEvent.loaded / total;
                        const overallProgress = Math.round(((i + currentFileProgress) / files.length) * 100);
                        setUploadProgress(overallProgress);
                    }
                });
            }
            await loadImages();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error uploading image');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this guide image?')) return;
        try {
            await api.delete(`/guide/${id}`);
            await loadImages();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting image');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            await api.put(`/guide/${id}`, editForm);
            setEditingId(null);
            await loadImages();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error updating image');
        }
    };

    const startEdit = (img: any) => {
        setEditingId(img.id);
        setEditForm({ title: img.title || '', description: img.description || '' });
    };

    // Drag-to-reorder
    const handleDragStart = (index: number) => setDragIdx(index);
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIdx(index);
    };
    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === dropIndex) {
            setDragIdx(null);
            setDragOverIdx(null);
            return;
        }
        const reordered = [...images];
        const [moved] = reordered.splice(dragIdx, 1);
        reordered.splice(dropIndex, 0, moved);
        setImages(reordered);
        setDragIdx(null);
        setDragOverIdx(null);
        try {
            await api.put('/guide/reorder', { orderedIds: reordered.map((img: any) => img.id) });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error reordering');
            await loadImages();
        }
    };
    const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

    const resolveUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">slideshow</span>
                        Guide Slideshow
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Upload and arrange images to create a step-by-step onboarding guide shown on the courses page.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="material-symbols-outlined text-base">photo_library</span>
                    {images.length} image{images.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Upload Area */}
            <div
                className="relative group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900/30"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(e.dataTransfer.files); }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-slate-500">Uploading...</span>
                            <span className="text-xs text-slate-400 mt-0.5">{uploadProgress}%</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors">cloud_upload</span>
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, or GIF · Multiple files supported</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Grid */}
            {images.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-4 block">image</span>
                    <p className="font-medium">No guide images yet</p>
                    <p className="text-sm mt-1">Upload images above to create your onboarding slideshow.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img: any, idx: number) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            className={`group relative bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all duration-200 ${
                                dragOverIdx === idx
                                    ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-primary/30'
                            } ${dragIdx === idx ? 'opacity-50' : ''}`}
                        >
                            {/* Order badge */}
                            <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shadow-lg">
                                {idx + 1}
                            </div>

                            {/* Drag handle */}
                            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                <span className="material-symbols-outlined text-white bg-black/50 backdrop-blur-sm rounded-lg p-1 text-sm">drag_indicator</span>
                            </div>

                            {/* Image — thumbnail derivative; falls back to the display
                                image for rows uploaded before derivatives existed. */}
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                    src={resolveUrl(img.thumbUrl || img.imageUrl)}
                                    alt={img.title || `Step ${idx + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {editingId === img.id ? (
                                    <div className="space-y-3">
                                        <input
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Step title"
                                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Step description"
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(img.id)}
                                                className="flex-1 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                            {img.title || `Step ${idx + 1}`}
                                        </h4>
                                        {img.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{img.description}</p>
                                        )}
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => startEdit(img)}
                                                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(img.id)}
                                                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tip */}
            {images.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Tip:</strong> Drag and drop cards to reorder. The slideshow on the courses page will auto-rotate through these images every 3 seconds.
                    </div>
                </div>
            )}
        </div>
    );
}
