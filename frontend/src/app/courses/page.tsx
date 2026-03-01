'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { motion } from 'framer-motion';

const PLACEHOLDER_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCx8O0XAYxQEfXeLfRH-6FfKX-9Z25q3IW2LEzqB3vq2Gjsi19mvFXdUV6eATG3m2EWGewTGxSWwZzZXOXhFNxiJGchZ1X7Ngn3ziO1W125d4PgRVqSLp30uM7ytxTK6mtU312iAhNc30w8kysWGRCCo23qNaFSvHITxKvRUlzopPkUReQMbvlGci6rk0oe9mu3vr9DRmMtZA_iAIhN1kR6zQSUXKhDrjd-2_Dc271nGTlZfm3brlEaniNbZg1m-EsYIoN4rqNGht0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBkoI6IgT-s9XZtFOv2dwr4KyqWE8pJJg94-RbwBmfi9IhAKp3Yp1bjzetwfS_gMx4Tq3PJ-X1lwtTw5w4S0HACGw4eysuDoWSn8rbNwscRsSx7Fi19fU5qWK0OBTw7HJEbnl6XnYKm6r4nlCKUzDSr1nGpHLBMfkZsFWBKM0TunZiJzjw5fpx5XIJMkLRe8cQhoR9m9wwVHQNyDbwdv_UcEzyFj8e6gHZEPVkgkYY_rNZsbMJ1BMa94IdCxdyi3c89PNNtk7Q7Mq4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDOSQjE_Mrupp-df7fuD3qhyuX-jTShqHtOn2VoTvQSN721UQfW7RYN-JjpKwzpeN6e4t5XlPCYTsqJeFdFzwtrLGPwLck7bSl7Q3I_Cre2j8vVHCGUsaFxWZBvkPoGab2lfl_eNQU99r8gADBgjK1xOnae5k0GjKbmo7M0_DxY_VEriHxQANtuqBXEIq7Y3KI0tJvZu8PGZDJZ6m09wiFSNYfX8sm4ddG5VFerUh6_hqhslQMZWWyvkbwfkOucUF3I9v6yG99L9o8",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDO8466j4mzKDgXi7LPd0EPmh2dIN4uQ52VAlNBYK9gNSEqA0ZowpnpCfmmWiE_BR1vwteneQahtXSpqVMUxSC9QgON6fI_c99I1Bis5fEeosY-2tlBRCl2ujNWddNQ4EmoQNpODXAsOdi2oDQhtiutNa1M7JWLRY9RzQZHIz-LG3LDydmUzLYKAmNEu_YQm-MxtVSKLVPLW5IqOErGI3ftJ6I7KNQLpq5fe9Ao5ZQ3hJDs3QZbazClnF1MKapxYGWEcU3DNQ33dbQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAspeDG7VrUYFBVvgfo_eG5ZZrEPuF_ACLlsissW4FcNdQM8rBBfdhA536LajsiMSRcbQKELN9PRW_ojTHL5ZhYjhZTpN5GPvhjDVuMwecJyweY1wCiQUPeH3CvTwumTyQbZNOOdwzxSMg8V6RPHQcKnD-Qr5_M3q2HpWrT0sbv3N34_uXLgzRlyNwmeNih7s7JICwS7xwVbXXWpkiH-0XuUQoXvsyFeJlDd_o7YU-oRwJpiQY1SMauIkk5kZICJeg_dcQnN__C5Ug",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMVI4QibcKTv1IHjyeeP27yhbo5EJWfCp4gz9iRSCrN0Zf1VAOM8kSdzkiQsiM23fAOe_temwpx-ybjVxCBzdJafTkdGKdSKAa8-8WXLmlVpInj39k9BqvcFz4taRZT-DKDQUDALDzsDyXH-qmUdq2R_sOFsHepXuLXoOwYb9IUgQo0Cn0jaObSfuwXt-8iVxGc8fzrlB2RvR8MS5wseYcLLR5JvOtzII_DaO_REkwxorbvvmozJ_z6DSTS57MZUbeAZNJPllI50g"
];
const FEATURED_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Fy8LpUlN3GFqNpV9X-BjytMgNvx7RDKWOLgjXNCnpOF8Iz3zKcWN39tVeb9trEyAwAsCI2TOZ8hqohhr1hRsabdhSNGo50NFi37W1CxL6hXO5kp0hHe44lwsc4c49yct7RlqlEfw48bpJfE8ffLX4fJjhKQqjWioPjYq_6attTcPxw0miSJSzgf37fdmkYhoqhps1YONg3v3tr7iPNINr7fbU5AeB8HFxuzFEnV6VCEdLtGkF8tf05VI82SmjEsR9FhSdcXzAaI";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState<string[]>(['All']);

    useEffect(() => {
        api.get('/courses').then((res) => {
            setCourses(res.data);
            // Build unique tags from all courses
            const allTags = new Set<string>();
            res.data.forEach((c: Course) => {
                if (c.tags) c.tags.forEach((t: string) => allTags.add(t));
            });
            setTags(['All', ...Array.from(allTags)]);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = courses.filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase());
        const matchesTag = selectedTag === 'All' || (c.tags && c.tags.includes(selectedTag));
        return matchesSearch && matchesTag;
    });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden">
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
            >
                {/* Hero Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary mb-4">
                                Expert-Led Training
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                                Course <span className="text-primary">Catalog</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                Upgrade your nursing career with industry-recognized certifications and professional development workshops.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            {courses.length} Courses Available Today
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="sticky top-20 z-40 bg-background-light/95 dark:bg-background-dark/95 py-4 mb-8 backdrop-blur-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
                                placeholder="Search by skill, topic, or certification name..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                            {tags.map(t => (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={t}
                                    onClick={() => setSelectedTag(t)}
                                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${selectedTag === t
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'
                                        }`}
                                >
                                    {t}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured Highlight */}
                {filtered.length > 0 && (
                    <div className="relative group overflow-hidden rounded-2xl mb-12 bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-10"></div>
                        <div className="relative z-20 p-8 md:p-12 flex flex-col justify-center max-w-xl min-h-[320px]">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                Most Popular This Month
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">{filtered[0].title}</h3>
                            <p className="text-slate-300 mb-8 leading-relaxed">{filtered[0].description || "Master the latest clinical techniques used in high-acuity environments."}</p>
                            <div className="flex flex-wrap items-center gap-6">
                                <Link href={`/courses/${filtered[0].id}`} className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2">
                                    Enroll Now <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-lg">4.9/5.0</span>
                                    <span className="text-slate-400 text-xs">{courses.length * 340} Students</span>
                                </div>
                            </div>
                        </div>
                        <div
                            className="absolute inset-0 w-full h-full bg-center bg-cover"
                            style={{
                                backgroundImage: `url('${filtered[0].thumbnail
                                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${filtered[0].thumbnail}`
                                    : FEATURED_IMAGE
                                    }')`
                            }}
                        ></div>
                    </div>
                )}

                {/* Course Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-pulse">
                                <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">menu_book</span>
                        <p className="mt-4 text-lg font-medium text-slate-500">No courses found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or check back later.</p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filtered.map((course, idx) => (
                            <motion.div
                                key={course.id}
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                        {/* Category tag */}
                                        <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            {course.tags && course.tags.length > 0 ? course.tags[0] : (course.category || 'Course')}
                                        </div>
                                        <img
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            src={course.thumbnail ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${course.thumbnail}` : PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                                <span className="material-symbols-outlined text-[18px]">star</span>
                                                4.{8 + (idx % 2)}
                                            </span>
                                            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                {course._count?.modules || 1} Modules
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-snug">{course.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-2">{course.description}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                            <span className="text-lg font-black text-slate-900 dark:text-white">
                                                {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
                                            </span>
                                            <span className="bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm">
                                                Enroll Now
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Newsletter Section */}
                <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Stay ahead in your field.</h3>
                            <p className="text-slate-600 dark:text-slate-400">Join 15,000+ CNAs receiving weekly updates on new courses, clinical best practices, and industry certification news.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input className="flex-1 px-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" placeholder="Enter your email address" type="email" />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                Subscribe Now
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}
