'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { motion, useInView } from 'framer-motion';
import { getFileUrl } from '@/lib/url-utils';
import {
  useSectionContainerVariants,
  useSectionItemVariants,
  useButtonHoverMotion,
  useCardHoverMotion,
  useGlowHoverMotion,
  useCounterAnimation,
} from '@/lib/motion';

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDL3Ct44XGGczsC3PgCH88mGoarkOnfGqO5yGNDimM3qDhIrSmMljtkwyBxg60rnV-szI55fdbZKDM8oVetYU7ZJdpAieBJboQWzpk1XaoIBNzAbjI-wLJVlGOKPPdHpWKF2EfsflwbmSY9bkWfbMDeaXNk8HiHIdVsi48QHKuhQeZ6Kf6nkz1yjTfCkLvCi6HqBf1gpkjyswXnw9aR9krjnmHHH2L9WFU7Aa29LuTa-8IFbraOD5LvQbGxu7f9x7CqhIzkfa58g7A";
const AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDsnLpkkrc9PH9kfDTlLQcql89H38_Kmxab-jno3FTeXMEwN0CkC4T4isqRHBPQC_Y9usfNybbUgOxxncyRw-p6xeXKwDK3Ui5XcV8hYA0qmGV8_brV4e5YaAmg34G9t3sceHP1dLRxwO0oxV3eybg37qDOdbZvo_BZSTC3XcT1uSna-BstaiMxkajoHNFHjjtYSVwAtiHVIcMlS3a4142Cvou37zoQcwpuCkQZylTY9SttMimqXjERi9jpMheMXMg8hjOIQj2I5ZQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC6Mfriz3JVqlE_4pU2k2z2mYUIH4raLITGXgJTvoESCEFV4cBo2KAIXimqIFBGwCqh_97-OjmYNsqRdfAa9qvWjT8NGubfw4D1GVCVJIGyO3gpcSsW2YpYLZpaIHRFTRJ2m-fSW0X5ySlaY3ILGh8PoQszHpUdH6GbkJHzVnyn9jMOy7RM8j-qd7U4wGJTT3IF7wsGFM-JKLUjanHrtKmDtcZnhLa_SX5NlSYR6tILLLIu5AecsxG53bQhg8md5cySeLREevZXbHk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAT9abQfh6Ithv2Gr_wcbnfBsFzTqtGj_b0FM3wAAmZy7B8lBBCbT2qj4y0FMg_MwTMLxFh9_RXeGOx5UdoBU9zepGCTBV8V8pMkUvHNvNqSs706ko1l1ZPXNWISEy75XmxPaHWfGIyUZHMlDmv69GBrZvU5WQ6Ku7ne5SgdeqaEIIn25aqPl6wMIo5KjpWFuZ0A2mVI1Qxp3EQUWZDHjD0K5Mb_Kc5uEm5n1-Y63Q07q3iSzSMiQkhyZWch0VmUsLznPgQE6xhubE"
];
const COURSE_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBPiqNN6doImeLGvx7AqVM_u_4eayC43oI1qy0L47mYSquj7P2LU2uiqhNUml0x_TPkVP_SqzwTTWn4t40NadHma8Oml-vufTbpB-E4JBd517h-eN08D4EeqelLzY5vLzqyNyAWiCs9gWxnUQ4eWC4Mtu_ewDysIdLL6374Ks3QUxtVzWwTZdrePNXMKp1i1DwQXG2OlvllhSdHPnef-CecorR7XnsUBcxSGayYdunYpXxf8wuRTtWERYCLZ8X0RJ4c4Y2rVG159PY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC8tvO4TD4F-WMTFdov_hEBkYocmKlBBNsfjx7KRDvnjDeIpsmxteAIhdgMOJIWwJ5Pcjql0Bg8SMjmBmoYxoNm6oCK1kxuGUv_cfzDVt3ZFNbA5KnL4T-b4zPKiR-8bwPHoctPiXoInpCpiGW3hK9EF9RLPtTm3s4RDpm9lI2Xm5W_WoPIsp6JyG3Lhkr_aLqt66-9FeAiX2VdE3zX_fNSvLWoi7ziJfp0JHpTCdlglthr4a-qH6-RtTeR_ofM4B5gdI3uY5cnlJE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDcCgxwDXJPRza7EyzuFXAh7WQbVoxQsH0I5J8OV6s8s-1tY32z592eFhmNqQbZ49-ZUldN0wW8klYYm1rkBNGEwqkauVjTbAf65c-dIjksIxyzBPKaFCP_m5e__ohl7nQZ2cvwxwVmEMB1r1g4EBgby8dOoQ-vvcOEKM_9-yXLOYr5hhg_xg2ygEY13tHeMRHzrHdXjOmpsvxR9sR0mv_N5Ii1p8ZuGnzIGTXkKU4r2KyTrJKXq4rwZhZoPt4h8m6KELksywHOrew"
];
const TESTIMONIALS = [
  { name: "Sarah Jenkins", role: "Lead CNA, Brightview Senior Living", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-9ccj2AW3PbcWnkG64zZp__O-ZjVuSeUBj9uqlocIrUBV8m3nryaYCvfteE8pScQ0_bfEr9B2B4EsTHbaWK0g-9CmhFLyBHbD2m4rEsi-hsSXzj-ipL4T2RBaPMJOCAW2xk99RKjcLUNGo_gBbmPlJ8eOb5uV1RZu2EXRHHJugV0ghpR8QqMMc7jLSMIIzodeD6NRSP4Z1CVeRHfobGPVJeJwHt5fhVCU2ay9SAZ-2izeXMi1gsBAMYlPixGU8pN8vjvNqZt_jbE", quote: "The dementia care certification helped me land a lead position at my facility. The content is practical and the platform is so easy to use on my phone during breaks." },
  { name: "Michael Rivera", role: "Director of Nursing, City Clinic", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7NzmnFrDemVTBMFYAytspafxa5vwrxpngervzGZvVFM8_PT_DqvVwdj2nK917fj6bCY5m_6zf52czmmHSBNfflxGqdniQwnLqn7V6Fw6Uywj5OS0jIKt8t5yotcPXYFIcrmYh5bMrP4K9FaUBoyHkFfIaf9K6QEXXtWoioSFzFIeS8Me8G528qC7qqdfXplvOMMarIsfmoWbKqB8IwiVPczqgLhLAKBzXaAbsShsTN2pPEJ9rzqwoG0-gfjxnF7h_83CiappLEhI", quote: "As a facility manager, training my staff has never been easier. We've seen a 15% increase in patient satisfaction scores since starting with Excelcommunity Living Inc." },
  { name: "Elena Thompson", role: "Senior Caregiver", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNJ4GXSaUjEBgZW2E0Cn96oMz_L-ivaYG0u_FjHJ75z7dz9XgDxYeucKMJw9Yy0WU9ztdGqptLAVpHuefYx2BQX0dlDnhPg8SyuU99UjdSMja5D8VqdVyGOdVOaJh0tlrcH9UfO8UakNOAmjYXxwrnijKKQowlMQuY8iTz2Y4U8hi0oFY1GMwWCyPVgD5Ew991s4qpL125MUsjP8fvokJqeJsAqnA6cBsBsGiLS5EvgSaB3N3-s-AbCwjzXx20KT_xeCa12ZWYgC4", quote: "The quality of the video lessons is incredible. It feels like you're in a real classroom. This is by far the best CE platform I've used in my 10-year career." },
];

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    students: 50000, // fallback
    completionRate: 94,
    clinics: 200,
  });

  const sectionContainer = useSectionContainerVariants();
  const sectionItem = useSectionItemVariants();
  const buttonHover = useButtonHoverMotion();
  const cardHover = useCardHoverMotion();
  const glowHover = useGlowHoverMotion();

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data.slice(0, 3))).catch(() => { });
    
    // Fetch real backend metrics
    api.get('/public/stats').then((res) => {
      if (res.data) {
        setStats({
          // Use real data or fallback to marketing numbers if database is completely empty
          students: res.data.students > 0 ? res.data.students : 0,
          completionRate: res.data.completionRate > 0 ? res.data.completionRate : 0,
          clinics: res.data.clinics > 0 ? res.data.clinics : 0,
        });
      }
    }).catch(err => console.error("Failed to fetch public stats:", err));
  }, []);

  const courseLabels = ["Bestseller", null, "Trending"];
  const courseColors = ["bg-primary", null, "bg-emerald-500"];

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <motion.div 
                    animate={{ y: [0, -50, 0], x: [0, 30, 0], scale: [1, 1.1, 1] }} 
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" 
                />
                <motion.div 
                    animate={{ y: [0, 40, 0], x: [0, -40, 0], scale: [1, 1.2, 1] }} 
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" 
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6 shadow-sm border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New: Advanced Wound Care Certification
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6"
              >
                Empower Your <span className="text-primary relative whitespace-nowrap">
                    Career in Care
                    <motion.svg 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                        className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none"
                    >
                        <path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </motion.svg>
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Industry-leading SaaS platform for Excelcommunity Living Inc professional development. Access state-approved courses, expert-led training, and career advancement tools designed for the modern healthcare professional.
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <motion.div {...glowHover}>
                  <Link href="/courses" className="shimmer-btn px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2">
                    Browse Courses <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all text-lg text-center h-full block leading-none flex items-center justify-center">
                    View Demo
                  </Link>
                </motion.div>
              </div>
              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.5 }}
                className="mt-8 flex items-center gap-4 text-sm text-slate-500 sm:justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {AVATARS.map((src, i) => (
                    <motion.img
                      key={i}
                      alt="User"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.3, ease: 'easeOut' }}
                      className="h-8 w-8 rounded-full border-2 border-white dark:border-background-dark object-cover"
                      src={src}
                    />
                  ))}
                </div>
                <span>Joined by <strong className="text-slate-900 dark:text-white">12,000+</strong> CNAs this month</span>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-16 lg:mt-0 lg:col-span-6 relative"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto w-full rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border-[6px] border-white/50 dark:border-slate-800/50 backdrop-blur-sm group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>
                <img alt="Platform Preview" className="w-full object-cover aspect-[4/3] transform group-hover:scale-105 transition-transform duration-700 ease-out" src={HERO_IMAGE} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10"></div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl flex items-center justify-between shadow-2xl z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center relative shadow-inner">
                      <div className="absolute inset-0 bg-primary/20 animate-ping rounded-xl"></div>
                      <span className="material-symbols-outlined text-primary text-2xl relative z-10">play_circle</span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary uppercase tracking-wider">Current Lesson</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">Patient Safety Protocols</p>
                    </div>
                  </div>
                  <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-emerald-400"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-background-dark border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatedStat 
              end={stats.students >= 1000 ? Math.floor(stats.students / 1000) : stats.students} 
              suffix={stats.students >= 1000 ? "k+" : ""} 
              label="Active Students" 
            />
            <AnimatedStat 
              end={stats.completionRate} 
              suffix="%" 
              label="Completion Rate" 
            />
            <AnimatedStat 
              end={stats.clinics >= 1000 ? Math.floor(stats.clinics / 1000) : stats.clinics} 
              suffix={stats.clinics >= 1000 ? "k+" : ""} 
              label="Certificates Issued" 
            />
            <AnimatedStatText value="4.9/5" label="Average Rating" />
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionItem}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
          >
            <div>
              <h2 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Our Catalog</h2>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">Featured Courses</h3>
            </div>
            <Link href="/courses" className="text-primary font-bold flex items-center gap-1 hover:underline underline-offset-4">
              View all courses <span className="material-symbols-outlined">chevron_right</span>
            </Link>
          </motion.div>

          <motion.div
            variants={sectionContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {courses.length > 0 ? courses.map((course, idx) => (
              <motion.div
                key={course.id}
                variants={sectionItem}
                {...cardHover}
                className="relative group h-full"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                <Link
                  href={`/courses/${course.id}`}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 transition-all hover:shadow-[0_20px_40px_-15px_rgba(13,185,242,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(13,185,242,0.1)] h-full flex flex-col relative z-0"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10"></div>
                    <img
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      src={course.thumbnail ? getFileUrl(course.thumbnail) : COURSE_IMAGES[idx % 3]}
                    />
                    {courseLabels[idx] && (
                      <div className={`absolute top-4 left-4 ${courseColors[idx]} text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg z-20 backdrop-blur-md bg-opacity-90 tracking-wider`}>
                        {courseLabels[idx]}
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1 relative bg-white dark:bg-slate-900 z-20">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span className="text-xs font-bold ml-1">4.9</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2 border-l border-slate-200 dark:border-slate-700 pl-3">1.2k Reviews</span>
                    </div>
                    
                    <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-slate-900 dark:text-white leading-tight">{course.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed flex-1">
                      {course.description || "Master specialized healthcare techniques and behavioral management in this comprehensive digital credential."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                      <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {course.price ? `$${course.price}` : 'Free'}
                      </span>
                      <span className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 font-bold text-sm shadow-sm group-hover:shadow-primary/30 flex items-center gap-2">
                        Enroll <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )) : (
              // Skeleton loading cards
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-pulse">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-800"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionItem}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">Trusted by Caregivers</h2>
            <p className="text-slate-600 dark:text-slate-400">Hear from professionals who advanced their careers with Excelcommunity Living Inc.</p>
          </motion.div>
          <motion.div
            variants={sectionContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                variants={sectionItem}
                {...cardHover}
                className="bg-background-light dark:bg-slate-800/50 p-8 rounded-2xl relative transition-colors"
              >
                <span className="material-symbols-outlined text-primary/30 text-6xl absolute top-4 right-4">format_quote</span>
                <p className="text-slate-700 dark:text-slate-300 italic mb-8 relative z-10">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <img alt={t.name} className="w-12 h-12 rounded-full object-cover" src={t.img} />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{t.name}</h5>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          variants={sectionItem}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-6xl mx-auto bg-primary rounded-[2rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-primary/40"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent)]" />
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full bg-white/8 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-3xl"
          />
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="flex-1 text-center md:text-left space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-[0.2em]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-70 blur-[2px]" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Enrollment Open
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                Ready to advance your{" "}
                <span className="relative whitespace-nowrap">
                  nursing career?
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-white/70 to-white/20 rounded-full" />
                </span>
              </h2>
              <p className="text-base md:text-lg text-white/85 max-w-xl">
                Build in-demand clinical skills, earn state‑approved certificates, and move into the next chapter of your career with flexible, self‑paced training.
              </p>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 md:gap-4 justify-center md:justify-start">
              <motion.div {...glowHover} className="w-full sm:w-auto">
                <Link
                  href="/register"
                  className="shimmer-btn flex items-center justify-center gap-2 px-10 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg shadow-primary/40 text-sm md:text-base"
                >
                  Create free account
                  <span className="material-symbols-outlined text-base md:text-lg">arrow_forward</span>
                </Link>
              </motion.div>
              <motion.div {...buttonHover} className="w-full sm:w-auto">
                <Link
                  href="/courses"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-primary/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/5 transition-all text-sm md:text-base"
                >
                  Explore course catalog
                  <span className="material-symbols-outlined text-base md:text-lg">menu_book</span>
                </Link>
              </motion.div>
              <p className="text-xs text-white/70 text-center md:text-left">
                No credit card required. Start learning in under 2 minutes.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/* ─── Animated Stat Counter Component ──────────────────────────────────────── */

function AnimatedStat({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const { count, ref } = useCounterAnimation(end, 2);
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.8, 0.25, 1] } } }} className="text-center">
      <p ref={ref as React.Ref<HTMLParagraphElement>} className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
        {count}{suffix}
      </p>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  );
}

function AnimatedStatText({ value, label }: { value: string; label: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.8, 0.25, 1] } } }} className="text-center">
      <p className="text-4xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  );
}
