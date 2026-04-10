'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileUrl } from '@/lib/url-utils';
import {
    useSectionContainerVariants,
    useSectionItemVariants,
    useButtonHoverMotion,
    useCardHoverMotion,
    useGlowHoverMotion,
} from '@/lib/motion';
import CourseCard from '@/components/CourseCard';

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
        <div className="min-h-screen bg-background-light dark:bg-background-dark overflow-x-hidden relative">
            {/* Ambient floating orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <motion.div
                    animate={{ y: [0, -50, 0], x: [0, 30, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[5%] right-[10%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-primary/[0.04] dark:bg-primary/[0.06] rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ y: [0, 40, 0], x: [0, -20, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
                    className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] max-w-[350px] max-h-[350px] bg-blue-400/[0.04] dark:bg-blue-400/[0.06] rounded-full blur-[100px]"
                />
            </div>

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
                    className="mb-10"
                >
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-primary/10 text-primary mb-4 animate-glow-pulse"
                            >
                                <span className="material-symbols-outlined text-[14px] mr-1.5">school</span>
                                Expert-Led Training
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.8, 0.25, 1] }}
                                className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight"
                            >
                                Course <span className="text-primary relative">
                                    Catalog
                                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary/60 to-primary/10 rounded-full" />
                                </span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                                className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
                            >
                                Upgrade your nursing career with industry-recognized certifications and professional development workshops.
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            {courses.length} Courses Available Today
                        </motion.div>
                    </div>
                </motion.div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 }}
                    className="sticky top-20 z-40 bg-background-light/80 dark:bg-background-dark/80 py-4 mb-8 backdrop-blur-xl rounded-2xl"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <motion.span
                                    animate={{ rotate: [0, 0, 0] }}
                                    className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors duration-300"
                                >search</motion.span>
                            </div>
                            <input
                                className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm transition-all duration-300 focus:shadow-[0_0_20px_rgba(13,185,242,0.1)]"
                                placeholder="Search by skill, topic, or certification name..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {tags.map(t => (
                                <motion.button
                                    {...buttonHover}
                                    key={t}
                                    onClick={() => setSelectedTag(t)}
                                    className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${selectedTag === t
                                        ? 'text-white shadow-lg shadow-primary/25'
                                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50 hover:shadow-sm'
                                        }`}
                                >
                                    {selectedTag === t && (
                                        <motion.span
                                            key="activeFilterTag"
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
                        key={`featured-${filtered[0]?.id}`}
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                        className="relative group overflow-hidden rounded-2xl mb-12 transition-all duration-500 hover:-translate-y-3 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/50 hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-[0_20px_60px_-15px_rgba(13,185,242,0.15),0_8px_24px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_60px_-15px_rgba(13,185,242,0.2),0_8px_24px_-8px_rgba(0,0,0,0.3)]"
                    >
                        {/* Animated gradient top accent */}
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-gradient-shift z-30" />

                        {/* Dynamic Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 dark:from-slate-900 dark:via-slate-900/80 to-transparent z-10"></div>
                        {/* Hover shine sweep */}
                        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        </div>

                        <div className="relative z-20 p-8 md:p-12 flex flex-col justify-center max-w-xl min-h-[320px]">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-4"
                            >
                                <span className="material-symbols-outlined text-sm animate-pulse">auto_awesome</span>
                                Most Popular This Month
                            </motion.div>
                            <motion.h3
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight"
                            >
                                {filtered[0].title}
                            </motion.h3>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="relative mb-8"
                            >
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                className="flex flex-wrap items-center gap-6"
                            >
                                <motion.div {...glowHover}>
                                    <Link href={`/courses/${filtered[0].id}`} className="shimmer-btn bg-primary hover:bg-primary/95 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 flex items-center gap-2 text-sm tracking-tight">
                                        ENROLL NOW <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </Link>
                                </motion.div>
                                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                                                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden z-10 transition-transform hover:scale-110 hover:z-20"
                                            >
                                                <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight">4.9/5.0</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{courses.length * 340}+ Students</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Featured background image with parallax-like hover */}
                        <motion.div
                            className="absolute inset-0 w-full h-full bg-center bg-cover -z-0"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                backgroundImage: `url('${filtered[0].thumbnail
                                    ? getFileUrl(filtered[0].thumbnail)
                                    : FEATURED_IMAGE
                                    }')`
                            }}
                        />
                    </motion.div>
                )}

                {/* Course Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/50">
                                <div className="h-56 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                </div>
                                <div className="p-7 space-y-4">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between">
                                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
                                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-28" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="text-center py-20"
                    >
                        <motion.span
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 block"
                        >
                            menu_book
                        </motion.span>
                        <p className="mt-4 text-lg font-medium text-slate-500">No courses found</p>
                        <p className="text-sm text-slate-400">Try adjusting your search or check back later.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={`grid-${search}-${selectedTag}`}
                        variants={sectionContainer}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {filtered.map((course, idx) => (
                            <CourseCard
                                key={course.id}
                                courseId={course.id}
                                name={course.title}
                                overview={course.description}
                                thumbnail={course.thumbnail ? getFileUrl(course.thumbnail) : PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                                link={`/courses/${course.id}`}
                                category={course.tags && course.tags.length > 0 ? course.tags[0] : (course.category || undefined)}
                                price={course.price ?? undefined}
                                modules={course._count?.modules || 1}
                                rating={4.8 + (idx % 2)}
                                delay={idx * 0.15}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
                    className="mt-20 pt-16 relative"
                >
                    {/* Separator with gradient */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 shadow-lg relative overflow-hidden">
                        {/* Background decoration */}
                        <motion.div
                            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -right-20 -top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none"
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative">
                            <div>
                                <motion.span
                                    initial={{ opacity: 0, y: 8 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="inline-flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-widest mb-3"
                                >
                                    <span className="material-symbols-outlined text-sm">mail</span>
                                    Newsletter
                                </motion.span>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Stay ahead in your field.</h3>
                                <p className="text-slate-600 dark:text-slate-400">Join 15,000+ CNAs receiving weekly updates on new courses, clinical best practices, and industry certification news.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    className="flex-1 px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-slate-900 dark:text-white transition-all duration-300 focus:shadow-[0_0_20px_rgba(13,185,242,0.1)]"
                                    placeholder="Enter your email address"
                                    type="email"
                                />
                                <motion.button
                                    {...glowHover}
                                    className="shimmer-btn bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    Subscribe Now
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
