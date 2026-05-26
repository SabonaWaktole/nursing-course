'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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


export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('All');
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState<string[]>(['All']);

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
                                Renew your certification with Excel Community Living any time anywhere.
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

                {/* Getting Started Slideshow */}
                <GettingStartedSlideshow />

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
                                credit={course.credit ?? null}
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

/* ═══════════════════════════════════════════
   GETTING STARTED SLIDESHOW
   ═══════════════════════════════════════════ */

function GettingStartedSlideshow() {
    const [guideSteps, setGuideSteps] = useState<{ step: number; image: string; title: string; description: string }[]>([]);
    const [activeStep, setActiveStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(true);
    const [guideLoading, setGuideLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const progressRef = useRef<NodeJS.Timeout | null>(null);
    const INTERVAL_MS = 3000;
    const PROGRESS_TICK = 30; // update progress every 30ms

    // Fetch guide images from API
    useEffect(() => {
        api.get('/guide')
            .then((res) => {
                const data = res.data.map((img: any, idx: number) => ({
                    step: idx + 1,
                    image: getFileUrl(img.imageUrl),
                    title: img.title || `Step ${idx + 1}`,
                    description: img.description || '',
                }));
                setGuideSteps(data);
            })
            .catch((err) => console.error('Failed to load guide:', err))
            .finally(() => setGuideLoading(false));
    }, []);

    const goToStep = useCallback((index: number) => {
        setActiveStep(index);
        setProgress(0);
    }, []);

    const nextStep = useCallback(() => {
        setActiveStep((prev) => (prev + 1) % (guideSteps.length || 1));
        setProgress(0);
    }, [guideSteps.length]);

    // Auto-advance timer
    useEffect(() => {
        if (isPaused || guideSteps.length === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
            return;
        }

        intervalRef.current = setInterval(nextStep, INTERVAL_MS);
        progressRef.current = setInterval(() => {
            setProgress((prev) => Math.min(prev + (PROGRESS_TICK / INTERVAL_MS) * 100, 100));
        }, PROGRESS_TICK);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (progressRef.current) clearInterval(progressRef.current);
        };
    }, [isPaused, nextStep, activeStep, guideSteps.length]);

    // Don't render if loading or no images
    if (guideLoading || guideSteps.length === 0) return null;

    const currentStep = guideSteps[activeStep] || guideSteps[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
            className="relative overflow-hidden rounded-2xl mb-12 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/50"
        >
            {/* Animated gradient top accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-gradient-shift z-30" />

            {/* Header */}
            <div className="px-6 md:px-10 pt-8 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
                            <span className="material-symbols-outlined text-sm animate-pulse">play_circle</span>
                            How to Get Started
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            Login & Start Learning
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Follow these simple steps to create your account and begin your courses.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="shrink-0 ml-4 w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/15 border border-slate-200 dark:border-slate-700 hover:border-primary/30 text-slate-500 dark:text-slate-400 hover:text-primary transition-all duration-300"
                        aria-label={isExpanded ? 'Collapse slideshow' : 'Expand slideshow'}
                    >
                        <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="material-symbols-outlined text-lg"
                        >
                            expand_less
                        </motion.span>
                    </button>
                </div>
            </div>

            {/* Two-column layout */}
            <AnimatePresence initial={false}>
            {isExpanded && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                className="overflow-hidden"
            >
            <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 px-6 md:px-10 pb-8">
                {/* Left: Step list */}
                <div className="lg:w-[280px] shrink-0 py-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
                    {guideSteps.map((step, i) => (
                        <button
                            key={step.step}
                            onClick={() => goToStep(i)}
                            className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal min-w-[160px] lg:min-w-0 ${
                                activeStep === i
                                    ? 'bg-primary/10 dark:bg-primary/15 border border-primary/30'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                            }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 transition-all duration-300 ${
                                    activeStep === i
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'
                                }`}
                            >
                                {step.step}
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className={`text-sm font-bold transition-colors duration-300 ${
                                        activeStep === i
                                            ? 'text-primary'
                                            : 'text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {step.title}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden lg:block leading-tight mt-0.5">
                                    {step.description}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Right: Image slideshow */}
                <div className="flex-1 relative">
                    {/* Browser-like frame */}
                    <div className="rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/50 shadow-xl">
                        {/* Fake browser bar */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                                <div className="w-3 h-3 rounded-full bg-green-400/70" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="bg-white dark:bg-slate-900 rounded-md px-3 py-1 text-xs text-slate-400 dark:text-slate-500 font-mono truncate">
                                    excelcommunityliving.com
                                </div>
                            </div>
                        </div>

                        {/* Image container */}
                        <div
                            className="relative aspect-video bg-slate-200 dark:bg-slate-900 overflow-hidden"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={currentStep.image}
                                        alt={`Step ${currentStep.step}: ${currentStep.title}`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-contain"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Step badge overlay */}
                            <div className="absolute top-4 left-4 z-10">
                                <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-black">
                                        {currentStep.step}
                                    </span>
                                    {currentStep.title}
                                </div>
                            </div>

                            {/* Pause indicator */}
                            <AnimatePresence>
                                {isPaused && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                                    >
                                        <span className="material-symbols-outlined text-sm">pause</span>
                                        Paused
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-primary"
                                style={{ width: `${progress}%` }}
                                transition={{ duration: 0.03, ease: 'linear' }}
                            />
                        </div>
                    </div>

                    {/* Mobile step description */}
                    <div className="lg:hidden mt-4 px-1">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={activeStep}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="text-sm text-slate-600 dark:text-slate-400"
                            >
                                {currentStep.description}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Dot indicators for quick reference */}
                    <div className="flex justify-center gap-2 mt-4">
                        {guideSteps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToStep(i)}
                                className={`rounded-full transition-all duration-300 ${
                                    activeStep === i
                                        ? 'w-8 h-2.5 bg-primary shadow-md shadow-primary/30'
                                        : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-primary/50'
                                }`}
                                aria-label={`Go to step ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            </motion.div>
            )}
            </AnimatePresence>
        </motion.div>
    );
}
