'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import {
  Stethoscope, BookOpen, GraduationCap, Users, Target, Eye, Clock, Heart,
  Shield, ChevronRight, ArrowRight, Pin, Calendar, ExternalLink,
  Mail, Phone, MapPin, Send, ArrowDown, Award, Star, Quote,
  DollarSignIcon
} from 'lucide-react';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { getFileUrl } from '@/lib/url-utils';
import CourseCard from '@/components/CourseCard';

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const SERVICES = [
  {
    title: 'State-Approved Courses',
    description: 'Access a comprehensive library of state-approved CNA training courses designed by healthcare professionals and aligned with current regulations.',
    icon: <Stethoscope size={32} />,
  },
  {
    title: 'Expert-Led Training',
    description: 'Learn from experienced nursing professionals through high-quality video lessons that feel like being in a real classroom.',
    icon: <BookOpen size={32} />,
  },
  {
    title: 'Certification Programs',
    description: 'Earn recognized certifications that advance your nursing career with flexible, self-paced training programs.',
    icon: <GraduationCap size={32} />,
  },
  {
    title: `Affordable Courses`,
    description: `The most affordable, high quality, and simplified Continuing Education Courses for CNA's `,
    icon: <DollarSignIcon size={32} />,
  },
];

const ABOUT_TABS: Record<string, { title: string; icon: React.ReactNode; content: { title: string; description: string }[] }> = {
  mission: {
    title: 'Our Mission',
    icon: <Target size={32} />,
    content: [
      { title: '"Knowledge produces best care" is our motto', description: 'Our mission is to provide the participants with knowledge and skills to help them become reliable, confident, caring and excellent healthcare providers.' },
      { title: 'Accessible Education', description: 'Making quality nursing assistant training accessible to everyone through flexible, self-paced online learning.' },
      { title: 'Empowering Care Everywhere', description: 'Building a community of skilled, compassionate caregivers who deliver outstanding patient care nationwide.' },
    ],
  },
  vision: {
    title: 'Our Vision',
    icon: <Eye size={32} />,
    content: [
      { title: 'Provide Opportunities', description: 'Our goal is to provide every student an opportunity to grow and gain experience they need in order to further their career in healthcare industry.' },
      { title: 'Innovative Learning', description: 'We aim to provide innovative, technology-driven education solutions that bridge the gap between classroom learning and hands-on clinical practice.' },
      { title: 'Advancing Healthcare Standards', description: 'By combining expert-led instruction with modern e-learning tools, we work to elevate the standard of patient care everywhere.' },
    ],
  },
  background: {
    title: 'Background',
    icon: <Clock size={32} />,
    content: [
      { title: 'Industry-Leading Platform', description: 'Excelcommunity Living Inc has built a comprehensive SaaS platform for healthcare professional development and certification training.' },
      { title: 'Trusted by Professionals', description: 'Excel Community living CNA CEUS are accredited by California department of public health CDPH. We follow the guidelines and curriculum given by CDPH.' },
      { title: 'Proven Results', description: 'Facilities using our training have seen measurable improvements in patient satisfaction scores and staff competency.' },
    ],
  },
  values: {
    title: 'Core Values',
    icon: <Heart size={32} />,
    content: [
      { title: 'Patient-Centered Care', description: 'Everything we teach is rooted in compassionate, patient-centered care that prioritizes safety and dignity.' },
      { title: 'Excellence in Education', description: 'We maintain the highest standards in our course content, ensuring every lesson is practical, current, and impactful.' },
      { title: 'Community & Support', description: 'We foster a supportive learning community where caregivers can grow, connect, and thrive in their careers.' },
    ],
  },
};

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Lead CNA, Brightview Senior Living',
    quote: 'The dementia care certification helped me land a lead position at my facility. The content is practical and the platform is so easy to use on my phone during breaks.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Rivera',
    role: 'Director of Nursing, City Clinic',
    quote: 'As a facility manager, training my staff has never been easier. We\'ve seen a 15% increase in patient satisfaction scores since starting with Excelcommunity Living Inc.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Elena Thompson',
    role: 'Senior Caregiver',
    quote: 'The quality of the video lessons is incredible. It feels like you\'re in a real classroom. This is by far the best CE platform I\'ve used in my 10-year career.',
    rating: 5,
  },
];


const STATS = [
  { label: 'Active Students', value: '2,500+', icon: <Users size={24} /> },
  { label: 'Completion Rate', value: '94%', icon: <Target size={24} /> },
  { label: 'Certificates Issued', value: '8,200+', icon: <Award size={24} /> },
  { label: 'Average Rating', value: '4.9/5', icon: <Star size={24} /> },
];

const COURSES = [
  {
    id: 1,
    name: 'Patient Safety Protocols',
    overview: 'Master essential safety procedures, infection control, and emergency protocols for clinical environments.',
    link: '/courses',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Dementia Care Certification',
    overview: 'Comprehensive training in dementia and Alzheimer\'s care, communication techniques, and behavioral management.',
    link: '/courses',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'CNA Fundamentals',
    overview: 'Core nursing assistant skills including vital signs, patient hygiene, mobility assistance, and documentation.',
    link: '/courses',
    thumbnail: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop',
  },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <AboutSection />
      <TestimonialsSection />
      <CoursesSection />
      <CTASection />
      <ContactSection />
    </div>
  );
}

/* ═══════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════ */

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.05]);
  const yShift = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  const [particles, setParticles] = useState<
    { id: number; size: number; x: number; y: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const title = 'Excelcommunity Living';
  const subtitle = '24 hour Continuing Education Courses For CNA’S';
  const tagline = `The most affordable, high quality, and simplified Continuing Education Courses for CNA's Complete your continuing education requirements from the comfort of your home anywhere any time at an affordable price. Don’t lose your CNA certificate. Start your continuing education courses TODAY!`;

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-6"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-black/75 dark:bg-black/80" />
      </div>

      {/* Gradient overlays */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-400/10 pointer-events-none z-[1]"
        style={{ opacity, scale }}
      />

      {/* Grid pattern */}
      <motion.div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="smallGrid" width="15" height="15" patternUnits="userSpaceOnUse">
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="url(#smallGrid)" />
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      {/* Glow blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] z-0"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-60 h-60 bg-purple-400/20 rounded-full blur-[80px] z-0"
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]) }}
      />
      <motion.div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-[60px] z-0" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary"
            style={{
              width: p.size + 'px',
              height: p.size + 'px',
              left: p.x + '%',
              top: p.y + '%',
              opacity: p.size > 3 ? 0.15 : 0.08,
            }}
            animate={{
              y: [p.y + '%', (p.y - 15) + '%', p.y + '%'],
              x: [p.x + '%', (p.x + (Math.random() > 0.5 ? 5 : -5)) + '%', p.x + '%'],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-4xl text-center pt-24"
        style={{ y: yShift }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo ring */}
        <div className="relative mx-auto mb-8 w-28 h-28 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/20"
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full border border-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-slate-900 dark:bg-[#1e293b]"
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              boxShadow: [
                '0 0 0 rgba(13, 185, 242, 0)',
                '0 0 15px rgba(13, 185, 242, 0.2)',
                '0 0 0 rgba(13, 185, 242, 0)',
              ],
            }}
            transition={{
              delay: 0.2,
              type: 'spring',
              bounce: 0.4,
              boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span className="text-primary text-3xl font-black">E</span>
          </motion.div>

          {/* Orbiting dots */}
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ x: 45, originX: -2, originY: 0 }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{ x: 40, originX: -1.8, originY: 0 }}
          />
        </div>

        {/* Tagline under logo */}
        <motion.p
          className="text-sm text-white/60 italic mb-6 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Knowledge produces quality care
        </motion.p>

        {/* Title with staggered letters */}
        <div className="overflow-hidden mb-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary inline-flex">
            {title.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
                className="inline-block relative"
              >
                {char === ' ' ? '\u00A0' : char}
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary/50"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
                />
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Animated line */}
        <motion.div
          className="relative h-0.5 w-0 mx-auto mb-8 overflow-hidden bg-primary/30"
          animate={{ width: '80%' }}
          transition={{ delay: 1.1, duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{
              delay: 1.3,
              duration: 2,
              times: [0, 0.5, 1],
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        </motion.div>

        {/* Subtitle with staggered words */}
        <div className="relative mb-4">
          <motion.p className="text-lg md:text-xl lg:text-2xl font-bold max-w-2xl mx-auto leading-relaxed text-blue-400">
            {subtitle.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-2 relative"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4 + i * 0.15, duration: 0.6, ease: 'easeOut' }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </div>

        {/* Tagline */}
        <motion.p
          className="text-lg md:text-xl mb-10 text-white/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.7 }}
        >
          {tagline}
        </motion.p>

        
      </motion.div>

     
    </div>
  );
}

/* ═══════════════════════════════════════════
   SERVICES SECTION
   ═══════════════════════════════════════════ */

function ServiceCard({
  title,
  description,
  icon,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`group p-6 rounded-lg transform transition-all duration-500 relative overflow-hidden
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        hover:-translate-y-2 hover:shadow-xl
        bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800
        hover:border-primary/30 dark:hover:border-primary/30
      `}
    >
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 bg-primary/10 text-primary group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 transition-colors duration-300 text-slate-900 dark:text-white group-hover:text-primary">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 group-hover:text-slate-500 transition-colors duration-300">
        {description}
      </p>
      <span className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full rounded-full bg-primary" />
    </div>
  );
}

function StatsSection() {
  const [stats, setStats] = useState(STATS);

  useEffect(() => {
    api.get('/public/stats').then((res) => {
      setStats([
        { label: 'Active Students', value: `${res.data.students}+`, icon: <Users size={24} /> },
        { label: 'Completion Rate', value: `${res.data.completionRate}%`, icon: <Target size={24} /> },
        { label: 'Certificates Issued', value: `${res.data.clinics}+`, icon: <Award size={24} /> },
        { label: 'Average Rating', value: '4.9/5', icon: <Star size={24} /> }, // Hardcoded rating
      ]);
    }).catch(console.error);
  }, []);

  return (
    <section className="py-16 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">What We Offer</h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
            Industry-leading SaaS platform for professional development. Access state-approved courses, expert-led training, and career advancement tools.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((s, i) => (
            <ServiceCard key={i} title={s.title} description={s.description} icon={s.icon} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   ABOUT SECTION
   ═══════════════════════════════════════════ */

function AboutSection() {
  const [activeTab, setActiveTab] = useState('mission');
  const tab = ABOUT_TABS[activeTab];

  return (
    <section id="about" className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">About Us</h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
            Learn more about Excelcommunity Living Inc&apos;s mission, vision, and the core values that drive our commitment to healthcare education.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {Object.entries(ABOUT_TABS).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-transparent text-primary border border-primary/30 hover:border-primary hover:shadow-[0_0_15px_4px_rgba(13,185,242,0.2)]'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {data.title}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-center mb-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mr-4 bg-primary/10 text-primary">
              {tab.icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{tab.title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tab.content.map((item, i) => (
              <div
                key={i}
                className="relative p-6 rounded-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden group
                  bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800
                  hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl"
              >
                <h4 className="text-xl font-semibold mb-3 transition-colors duration-300 text-primary group-hover:text-primary/80">
                  {item.title}
                </h4>
                <p className="transition-colors duration-300 text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
                <span className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full rounded-full bg-primary" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}


function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Trusted by Caregivers</h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
            Hear from professionals who advanced their careers with Excelcommunity Living Inc.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group relative p-8 rounded-lg transition-all duration-500 hover:-translate-y-2 overflow-hidden
                bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800
                hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl"
            >
              <Quote size={32} className="text-primary/20 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6 italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{t.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-500">{t.role}</p>
              </div>
              <span className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full rounded-full bg-primary" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════
   PARTNERS SECTION
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   COURSES SECTION
   ═══════════════════════════════════════════ */

function CoursesSection() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then((res) => {
      setFeaturedCourses(res.data.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const displayCourses = featuredCourses.length > 0 ? featuredCourses : (loading ? [] : COURSES.slice(0, 3));

  return (
    <section id="courses" className="py-20 px-4 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Featured Courses</h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
            Explore our catalog of state-approved training courses designed for nursing assistants and healthcare professionals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
             [1, 2, 3].map((i) => (
               <div key={i} className="bg-white dark:bg-slate-900/80 rounded-lg h-96 animate-pulse border border-slate-200 dark:border-slate-800" />
             ))
          ) : (
            displayCourses.map((course, i) => {
              const isDynamic = 'title' in course;
              const courseId = isDynamic ? course.id : (course as any).id;
              const name = isDynamic ? (course as Course).title : (course as any).name;
              const overview = isDynamic ? (course as Course).description : (course as any).overview;
              const link = "/courses/" + courseId;
              
              let thumbnail = (course as any).thumbnail;
              if (isDynamic && (course as Course).thumbnail) {
                 thumbnail = getFileUrl((course as Course).thumbnail!);
              } else if (!thumbnail) {
                 thumbnail = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop';
              }

              return (
                <CourseCard
                  key={courseId}
                  courseId={courseId}
                  name={name}
                  overview={overview}
                  thumbnail={thumbnail}
                  link={link}
                  delay={i * 0.15}
                  category={isDynamic ? ((course as Course).tags?.[0] || (course as Course).category || undefined) : undefined}
                />
              );
            })
          )}
        </div>
        <div className="text-center mt-12">
          <a
            href="/courses"
            className="group relative inline-flex items-center px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 overflow-hidden bg-primary text-white hover:bg-primary/90"
          >
            <span className="absolute inset-0 overflow-hidden">
              <span className="absolute left-0 top-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-700" />
            </span>
            <span className="relative flex items-center">
              Explore Course Catalog
              <BookOpen className="h-5 w-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CTA SECTION
   ═══════════════════════════════════════════ */

function CTASection() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
            Ready to advance your nursing career?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Build in-demand clinical skills, earn state-approved certificates, and move into the next chapter of your career with flexible, self-paced training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 overflow-hidden bg-primary text-white hover:bg-primary/90"
            >
              <span className="absolute inset-0 overflow-hidden">
                <span className="absolute left-0 top-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[45deg] translate-x-[-200%] group-hover:translate-x-[400%] transition-transform duration-700" />
              </span>
              <span className="relative flex items-center">
                Create Free Account
                <ArrowRight className="h-5 w-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-2" />
              </span>
            </a>
            <a
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300
                bg-transparent text-primary border border-primary/30 hover:border-primary hover:shadow-[0_0_15px_4px_rgba(13,185,242,0.2)]"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Explore Course Catalog
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
            No credit card required. Start learning in under 2 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CONTACT SECTION
   ═══════════════════════════════════════════ */

function ContactSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    // Simulate subscribe
    setTimeout(() => {
      setStatus('success');
      setMessage('Successfully subscribed to newsletter!');
      setEmail('');
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 px-4 bg-white dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Get In Touch</h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
            Have a question about our courses or looking to enroll your team? Reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h4>
                <p className="text-slate-600 dark:text-slate-400">info@excelcommunityliving.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Phone</h4>
                <p className="text-slate-600 dark:text-slate-400">+1 (800) 555-0199</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Location</h4>
                <p className="text-slate-600 dark:text-slate-400">United States</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-background-light dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Get the latest course updates, certifications, and career tips delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send size={16} />
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
            {status === 'success' && (
              <p className="mt-3 text-sm text-emerald-500">{message}</p>
            )}
            {status === 'error' && (
              <p className="mt-3 text-sm text-red-500">{message}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
