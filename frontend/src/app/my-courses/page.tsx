'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Enrollment } from '@/lib/types';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

export default function MyCoursesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push('/login'); return; }
        api.get('/courses/my/enrollments').then((res) => {
            setEnrollments(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user, router]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">My Learning</h1>

                {enrollments.length === 0 ? (
                    <div className="text-center py-20 rounded-xl border border-dashed border-slate-300 bg-white">
                        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-lg font-medium text-slate-500">No courses yet</p>
                        <p className="text-sm text-slate-400 mb-4">Start your learning journey by enrolling in a course.</p>
                        <Link href="/courses" className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment) => (
                            <Link
                                key={enrollment.id}
                                href={`/courses/${enrollment.course.id}`}
                                className="group flex flex-col rounded-xl bg-white border border-slate-200 overflow-hidden hover:shadow-md transition"
                            >
                                <div className="h-2 bg-slate-100">
                                    <div
                                        className="h-full bg-blue-900 transition-all"
                                        style={{ width: `${enrollment.progress}%` }}
                                    />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition">{enrollment.course.title}</h3>
                                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{enrollment.course.description}</p>

                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            {enrollment.course._count?.lessons || 0} lessons
                                        </span>
                                        {enrollment.completed ? (
                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                <CheckCircle className="h-3.5 w-3.5" /> Completed
                                            </span>
                                        ) : (
                                            <span className="text-blue-900 font-medium">{enrollment.progress}% done</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
