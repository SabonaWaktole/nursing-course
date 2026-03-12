'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { motion } from 'framer-motion';
import { getFileUrl } from '@/lib/url-utils';
import {
    useSectionContainerVariants,
    useSectionItemVariants,
    useButtonHoverMotion,
    useCardHoverMotion,
    useGlowHoverMotion,
} from '@/lib/motion';

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
    const [isExpanded, setIsExpanded] = useState(false);
    const sectionContainer = useSectionContainerVariants();
    const sectionItem = useSectionItemVariants();
    const buttonHover = useButtonHoverMotion();
    const cardHover = useCardHoverMotion();
    const glowHover = useGlowHoverMotion();
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
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Header */}
                <motion.div
                    variants={sectionItem}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                    className="mb-10"
                >
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
                </motion.div>

                {/* Filters & Search */}
                <motion.div
                    variants={sectionItem}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="sticky top-20 z-40 bg-background-light/95 dark:bg-background-dark/95 py-4 mb-8 backdrop-blur-sm"
                >
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
                                    {...buttonHover}
                                    key={t}
                                    onClick={() => setSelectedTag(t)}
                                    className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${selectedTag === t
                                        ? 'text-white shadow-lg shadow-primary/25'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'
                                        }`}
                                >
                                    {selectedTag === t && (
                                        <motion.span
                                            layoutId="activeFilterTag"
                                            className="absolute inset-0 bg-primary rounded-xl -z-10"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    {t}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Featured Highlight */}
                {filtered.length > 0 && (
                    <motion.div
                        variants={sectionItem}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-80px" }}
                        className="relative group overflow-hidden rounded-3xl mb-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-500"
                    >
                        {/* Dynamic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 dark:from-slate-900 dark:via-slate-900/60 to-transparent z-10"></div>

                        <div className="relative z-20 p-8 md:p-12 flex flex-col justify-center max-w-xl min-h-[320px]">
                            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-4">
                                <span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span>
                                Most Popular This Month
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{filtered[0].title}</h3>

                            <div className="relative mb-8">
                                <p className={`text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-all duration-500 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                                    {filtered[0].description || "Master the latest clinical techniques used in high-acuity environments. This comprehensive course covers advanced nursing protocols, emergency response strategies, and evidence-based patient care."}
                                </p>
                                {(filtered[0].description?.length > 160 || !filtered[0].description) && (
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="text-primary hover:text-primary/80 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-1 transition-colors"
                                    >
                                        {isExpanded ? (
                                            <>See Less <span className="material-symbols-outlined text-sm rotate-180">expand_more</span></>
                                        ) : (
                                            <>See More <span className="material-symbols-outlined text-sm">expand_more</span></>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <Link href={`/courses/${filtered[0].id}`} className="group relative isolate overflow-hidden bg-primary hover:bg-primary/95 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center gap-2 text-sm tracking-tight shimmer-btn">
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    ENROLL NOW <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden z-10 transition-transform hover:scale-110 hover:z-20">
                                                <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight">4.9/5.0</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{courses.length * 340}+ Students</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            {...cardHover}
                            className="absolute inset-0 w-full h-full bg-center bg-cover -z-0"
                            style={{
                                backgroundImage: `url('${filtered[0].thumbnail
                                    ? getFileUrl(filtered[0].thumbnail)
                                    : FEATURED_IMAGE
                                    }')`
                            }}
                        ></motion.div>
                    </motion.div>
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
                        variants={sectionContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filtered.map((course, idx) => (
                            <motion.div
                                key={course.id}
                                variants={sectionItem}
                                {...cardHover}
                            >
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 transition-all hover:shadow-[0_20px_40px_-15px_rgba(13,185,242,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(13,185,242,0.1)] h-full flex flex-col relative z-0"
                                >
                                    <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                                    <div className="relative h-48 md:h-56 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10"></div>
                                        {/* Category tag */}
                                        <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider shadow-lg">
                                            {course.tags && course.tags.length > 0 ? course.tags[0] : (course.category || 'Course')}
                                        </div>
                                        <img
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            src={course.thumbnail ? getFileUrl(course.thumbnail) : PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                                        />
                                    </div>
                                    <div className="p-8 flex flex-col flex-1 relative bg-white dark:bg-slate-900 z-20">
                                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                                                <span className="material-symbols-outlined text-[14px]">star</span>
                                                <span className="text-xs font-bold ml-1">4.{8 + (idx % 2)}</span>
                                            </div>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                {course._count?.modules || 1} Modules
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors">{course.title}</h4>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 flex-1 line-clamp-2 leading-relaxed">{course.description}</p>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                                {course.price && course.price > 0 ? `$${course.price}` : 'Free'}
                                            </span>
                                            <span className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 font-bold text-sm shadow-sm group-hover:shadow-primary/30 flex items-center gap-2">
                                                Enroll Now <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Newsletter Section */}
                <motion.div
                    variants={sectionItem}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                    className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-16"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Stay ahead in your field.</h3>
                            <p className="text-slate-600 dark:text-slate-400">Join 15,000+ CNAs receiving weekly updates on new courses, clinical best practices, and industry certification news.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input className="flex-1 px-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent focus:ring-2 focus:ring-primary text-slate-900 dark:text-white" placeholder="Enter your email address" type="email" />
                            <motion.button
                                {...buttonHover}
                                className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                Subscribe Now
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
