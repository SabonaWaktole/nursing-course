import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ArrowRight, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { useCardHoverMotion } from '@/lib/motion';

interface CourseCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  courseId: string | number;
  name: string;
  overview: string;
  thumbnail: string;
  link: string;
  delay?: number;
  // Extra fields for the courses page
  category?: string;
  price?: number;
  modules?: number;
  rating?: number;
  credit?: number | null;
}

export default function CourseCard({
  courseId,
  name,
  overview,
  thumbnail,
  link,
  delay = 0,
  category,
  price,
  modules,
  rating,
  credit,
  ...motionProps
}: CourseCardProps) {
  const cardHover = useCardHoverMotion();

  return (
    <motion.div
      initial={motionProps.initial || { opacity: 0, y: 24 }}
      whileInView={motionProps.whileInView || { opacity: 1, y: 0 }}
      viewport={motionProps.viewport || { once: true }}
      transition={motionProps.transition || { delay, duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
      variants={motionProps.variants}
      whileHover={{ y: -12 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative rounded-2xl overflow-hidden
        flex flex-col h-full
        bg-white dark:bg-slate-900/60 backdrop-blur-sm
        border border-slate-200/80 dark:border-slate-700/50
        transition-colors transition-shadow duration-500
        hover:border-primary/40 dark:hover:border-primary/40
        hover:shadow-[0_20px_60px_-15px_rgba(13,185,242,0.15),0_8px_24px_-8px_rgba(0,0,0,0.1)]
        dark:hover:shadow-[0_20px_60px_-15px_rgba(13,185,242,0.2),0_8px_24px_-8px_rgba(0,0,0,0.3)]
        ${motionProps.className || ''}`}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-purple-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Image with overlay gradient */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {category && (
          <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider shadow-lg">
            {category}
          </div>
        )}
        <img
          src={thumbnail}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-6 flex flex-col flex-1 relative z-10 bg-white dark:bg-transparent">
        {rating !== undefined && modules !== undefined && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-current mr-1" />
              <span className="text-xs font-bold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {modules} Modules
            </span>
          </div>
        )}

        <h3 className="text-lg font-bold mb-2 transition-colors duration-300 text-slate-900 dark:text-white group-hover:text-primary line-clamp-1">
          {name}
        </h3>
        <p className="text-[14px] leading-relaxed mb-5 transition-colors duration-300 text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
          {overview}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
          {price !== undefined && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {price && price > 0 ? `$${price}` : <span className="text-emerald-500">Free</span>}
              </span>
              {credit ? (
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Credit: {credit}hr
                </span>
              ) : null}
            </div>
          )}
          <Link
            href={link}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 group/link
              bg-primary/10 text-primary hover:bg-primary hover:text-white ml-auto"
          >
            Enroll Now
            <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>

      <span className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full bg-gradient-to-r from-primary via-blue-400 to-primary/50 z-20" />
    </motion.div>
  );
}
