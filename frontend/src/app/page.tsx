'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { motion } from 'framer-motion';
import { getFileUrl } from '@/lib/url-utils';

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

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data.slice(0, 3))).catch(() => { });
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New: Advanced Wound Care Certification
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Empower Your <span className="text-primary">Career in Care</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                Industry-leading SaaS platform for Excelcommunity Living Inc professional development. Access state-approved courses, expert-led training, and career advancement tools designed for the modern healthcare professional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/courses" className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2">
                    Browse Courses <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all text-lg text-center h-full block leading-none flex items-center justify-center">
                    View Demo
                  </Link>
                </motion.div>
              </div>
              {/* Social proof */}
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 sm:justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {AVATARS.map((src, i) => (
                    <img key={i} alt="User" className="h-8 w-8 rounded-full border-2 border-white dark:border-background-dark object-cover" src={src} />
                  ))}
                </div>
                <span>Joined by <strong className="text-slate-900 dark:text-white">12,000+</strong> CNAs this month</span>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-16 lg:mt-0 lg:col-span-6 relative"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto w-full rounded-2xl shadow-2xl overflow-hidden border-8 border-white dark:border-slate-800"
              >
                <img alt="Platform Preview" className="w-full object-cover aspect-[4/3]" src={HERO_IMAGE} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">play_circle</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Current Lesson</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Patient Safety Protocols</p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-primary"></div>
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
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: "50k+", label: "Active Students" },
              { value: "94%", label: "Completion Rate" },
              { value: "200+", label: "Partner Clinics" },
              { value: "4.9/5", label: "Average Rating" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="text-center"
              >
                <p className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {courses.length > 0 ? courses.map((course, idx) => (
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
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group transition-all hover:shadow-2xl hover:shadow-primary/10 h-full block"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={course.thumbnail ? getFileUrl(course.thumbnail) : COURSE_IMAGES[idx % 3]}
                    />
                    {courseLabels[idx] && (
                      <div className={`absolute top-4 left-4 ${courseColors[idx]} text-white text-[10px] font-black uppercase px-2 py-1 rounded`}>
                        {courseLabels[idx]}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-yellow-400 text-sm">star</span>
                      ))}
                      <span className="text-xs font-bold text-slate-500 ml-1">4.9 (1.2k)</span>
                    </div>
                    <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-slate-900 dark:text-white">{course.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                      {course.description || "Master specialized healthcare techniques and behavioral management."}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {course.price ? `$${course.price}` : 'Free'}
                      </span>
                      <span className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">add_shopping_cart</span>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">Trusted by Caregivers</h2>
            <p className="text-slate-600 dark:text-slate-400">Hear from professionals who advanced their careers with Excelcommunity Living Inc.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto bg-primary rounded-[2rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">Ready to Advance Your Career?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto relative z-10">Join thousands of CNAs improving their skills and increasing their earning potential today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="px-10 py-4 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg text-lg block">Create Free Account</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/courses" className="px-10 py-4 bg-primary border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-lg block">Compare Plans</Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
