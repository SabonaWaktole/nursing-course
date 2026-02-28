'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Course } from '@/lib/types';
import { ArrowRight, Hospital, Pill, Briefcase, ShieldCheck, Star, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data.slice(0, 3))).catch(() => { });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Secondary Banner CTA */}
      <section className="relative overflow-hidden bg-slate-900 py-20 lg:py-28">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Medical background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h3 className="text-amber-500 font-bold text-lg md:text-xl tracking-wide uppercase mb-4">
              Welcome To Excel Community Living Inc.
            </h3>

            <h2 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              (Waiting To Be Approved)<br />
              Continuing Education for Adult<br />
              residential facility administrators<br />
              (ARF)
            </h2>

            <p className="text-slate-200 text-lg md:text-xl max-w-3xl mb-10">
              Welcome to the online 24 hour resource designed to help you get the required continuing education classes needed to renew your certification.
            </p>

            <Link
              href="/courses"
              className="inline-flex h-14 items-center justify-center rounded bg-pink-500 px-10 text-base font-bold text-white transition hover:bg-pink-600 shadow-lg hover:shadow-pink-500/25 uppercase tracking-wider"
            >
              Find courses
            </Link>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

            {/* Left Content */}
            <div className="flex flex-col items-start gap-6">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-5xl lg:text-5xl">
                Your <span className="text-teal-500">One-Stop</span> Continuing Education
              </h1>

              <h2 className="text-2xl font-bold text-teal-500 mt-2">
                Courses We Offer
              </h2>

              <ul className="space-y-3 mt-4 text-slate-500 font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Preventing Falls
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  How to Plan for Workplace Emergencies
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Drug Facts
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Autism Spectrum Disorder
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Identifying and Treating Attention Deficit Hyperactivity Disorder
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Drugs, Brains and Behavior The Science of Addiction
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Workplace violence and response
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Marijuana: Facts for Teens
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                  Active Shooter Planning and Response in a Healthcare Setting
                </li>
              </ul>
            </div>

            {/* Right Image */}
            <div className="relative lg:ml-auto w-full">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm bg-slate-100 relative">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Nurse taking blood pressure of a patient"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses / Academic Programs */}
      <section className="py-20 sm:py-28 bg-slate-50 relative" id="courses">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-multiply pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-3">Popular Courses</h3>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Academic Programs
            </h2>
          </div>

          {/* Filter / Sort Dropdown (Visual Only) */}
          <div className="flex justify-end mb-8">
            <div className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition">
              Release Date (newest first)
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.length > 0 ? courses.map((course, idx) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group flex flex-col overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  {/* Dynamic placeholer image based on index to show variety */}
                  <img
                    src={
                      idx === 0 ? "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" :
                        idx === 1 ? "https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" :
                          "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Bookmark Icon */}
                  <button className="absolute top-4 right-4 h-10 w-10 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition border border-white/20">
                    <svg className="w-5 h-5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-6 pt-5 bg-white border-t-0">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {course.description || "Learn essential skills required for maintaining a healthy and safe residential environment in compliance with state regulations."}
                  </p>

                  <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 mr-2 rounded">
                      ARF Credits
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            )) : (
              // Empty State
              <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-slate-200 rounded animate-pulse">
                Loading curriculum...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded shadow-lg transition"
          aria-label="Scroll to top"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
