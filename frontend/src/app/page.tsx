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
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="flex flex-col items-start gap-6">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                <span className="mr-2 flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                Next Cohort Starting Soon
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Start Your Career in Healthcare with{' '}
                <span className="text-indigo-600">Certified Nursing Assistant</span> Courses
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                Join thousands of compassionate caregivers. Get certified, gain practical skills, and secure a job in hospitals or nursing homes in just 4 weeks.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/courses"
                  className="flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-8 text-base font-bold text-white transition hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  Start Learning
                </Link>
                <Link
                  href="/login"
                  className="flex h-12 items-center justify-center rounded-lg bg-white border border-indigo-200 px-8 text-base font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/courses"
                  className="flex h-12 items-center justify-center rounded-lg bg-white border border-slate-200 px-8 text-base font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
                >
                  View Syllabus
                </Link>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-white text-xs font-bold text-white">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-white">
                    <span className="text-xs">+5k</span>
                  </div>
                </div>
                <p>Certified graduates working in healthcare</p>
              </div>
            </div>
            <div className="relative lg:ml-auto">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <p className="text-2xl font-bold">Learn. Certify. Heal.</p>
                  <p className="mt-2 text-indigo-100">Your healthcare journey starts here</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-white p-4 shadow-xl md:block max-w-[240px]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">State Approved</p>
                    <p className="text-xs text-slate-500">Accredited CNA Program</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { value: '5k+', label: 'Certified CNAs' },
              { value: '98%', label: 'Exam Pass Rate' },
              { value: '200+', label: 'Hospital Partners' },
              { value: '4.9', label: 'Student Rating' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="py-16 sm:py-24" id="courses">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Core Curriculum</h2>
                <p className="mt-2 text-lg text-slate-600">Essential training modules for your Nursing Assistant certification.</p>
              </div>
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                View All Modules <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg border border-slate-100"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-4xl font-black text-white/20">{course.title.charAt(0)}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                      <span className="ml-1 text-xs font-medium text-slate-500">(5.0)</span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{course.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-2">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm font-medium text-slate-700">
                        {course.instructor?.name || 'Instructor'}
                      </span>
                      <span className="text-sm font-bold text-indigo-600">
                        {course._count?.lessons || 0} lessons
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why Train With Us</h2>
            <p className="mt-4 text-lg text-slate-600">We provide the most comprehensive path to your CNA certification.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Hospital, title: 'Clinical Placements', desc: 'Guaranteed clinical hours at top local hospitals and nursing facilities to gain real experience.' },
              { icon: Pill, title: 'State Board Prep', desc: 'Intensive review sessions and mock exams to ensure you pass your state certification on the first try.' },
              { icon: Briefcase, title: 'Job Assistance', desc: 'Direct connections to healthcare employers who are actively hiring our graduates.' },
            ].map((feature) => (
              <div key={feature.title} className="flex flex-col items-start rounded-xl border border-slate-100 bg-slate-50 p-8 transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-indigo-600 px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Join the Healthcare Workforce?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">Enroll today and start making a difference in patients&apos; lives in as little as 4 weeks.</p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/register" className="rounded-lg bg-white px-8 py-3 text-base font-bold text-indigo-600 transition hover:bg-indigo-50">Apply Now</Link>
                <Link href="/courses" className="rounded-lg bg-indigo-700 px-8 py-3 text-base font-bold text-white transition hover:bg-indigo-800 border border-indigo-500">Browse Courses</Link>
              </div>
            </div>
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
