'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { Search, Star, BookOpen, Users } from 'lucide-react';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/courses').then((res) => {
            setCourses(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Nursing Course Catalog</h1>
                        <p className="mt-2 text-lg text-slate-600">Essential training modules for your Nursing Assistant certification.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
                        <p className="mt-4 text-slate-500">Loading courses...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-lg font-medium text-slate-500">No courses found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or check back later.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((course) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.id}`}
                                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg border border-slate-100"
                            >
                                {/* Card image / thumbnail */}
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                                    {course.thumbnail ? (
                                        <img
                                            alt={course.title}
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            src={course.thumbnail}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-emerald-500">
                                            <span className="text-5xl font-black text-white/20">{course.title.charAt(0)}</span>
                                        </div>
                                    )}
                                    <div className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-bold text-slate-900 backdrop-blur-sm">
                                        {course._count?.modules || 0} modules
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="flex flex-1 flex-col p-5">
                                    {/* Star rating */}
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="h-3.5 w-3.5 fill-current" />
                                        ))}
                                        <span className="ml-1 text-xs font-medium text-slate-500">(5.0)</span>
                                    </div>

                                    <h3 className="mt-2 text-xl font-bold text-slate-900">{course.title}</h3>
                                    <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-2">{course.description}</p>

                                    {/* Footer: instructor + price */}
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                                                {(course.instructor?.name || 'I').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{course.instructor?.name || 'Instructor'}</span>
                                        </div>
                                        <span className="text-lg font-bold text-blue-900">
                                            {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
                                        </span>
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
