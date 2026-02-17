import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white pt-16 pb-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 text-indigo-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                                <GraduationCap className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">CNA Pro</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-slate-600">
                            Empowering the next generation of healthcare heroes with quality education and support.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Programs</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li><Link href="/courses" className="hover:text-indigo-600">CNA Certification</Link></li>
                            <li><Link href="/courses" className="hover:text-indigo-600">Home Health Aide</Link></li>
                            <li><Link href="/courses" className="hover:text-indigo-600">CPR & First Aid</Link></li>
                            <li><Link href="/courses" className="hover:text-indigo-600">Continuing Ed</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Institution</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li><Link href="/" className="hover:text-indigo-600">About Us</Link></li>
                            <li><Link href="/" className="hover:text-indigo-600">Accreditation</Link></li>
                            <li><Link href="/" className="hover:text-indigo-600">Instructors</Link></li>
                            <li><Link href="/" className="hover:text-indigo-600">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-600">
                            <li><Link href="/my-courses" className="hover:text-indigo-600">Student Portal</Link></li>
                            <li><Link href="/courses" className="hover:text-indigo-600">Course Catalog</Link></li>
                            <li><Link href="/certificates" className="hover:text-indigo-600">Certificates</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <p className="text-center text-sm text-slate-500">© {new Date().getFullYear()} CNA Pro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
