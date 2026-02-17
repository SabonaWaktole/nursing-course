import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-900 pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 text-blue-400">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                                <GraduationCap className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">CNA Pro</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-slate-400">
                            Empowering the next generation of healthcare heroes with quality education and support.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Programs</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li><Link href="/courses" className="hover:text-blue-400">CNA Certification</Link></li>
                            <li><Link href="/courses" className="hover:text-blue-400">Home Health Aide</Link></li>
                            <li><Link href="/courses" className="hover:text-blue-400">CPR & First Aid</Link></li>
                            <li><Link href="/courses" className="hover:text-blue-400">Continuing Ed</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Institution</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li><Link href="/" className="hover:text-blue-400">About Us</Link></li>
                            <li><Link href="/" className="hover:text-blue-400">Accreditation</Link></li>
                            <li><Link href="/" className="hover:text-blue-400">Instructors</Link></li>
                            <li><Link href="/" className="hover:text-blue-400">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Resources</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-400">
                            <li><Link href="/my-courses" className="hover:text-blue-400">Student Portal</Link></li>
                            <li><Link href="/courses" className="hover:text-blue-400">Course Catalog</Link></li>
                            <li><Link href="/certificates" className="hover:text-blue-400">Certificates</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-800 pt-8">
                    <p className="text-center text-sm text-slate-500">© {new Date().getFullYear()} CNA Pro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
