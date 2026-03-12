import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-10 border-t border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative mb-12">
                    <div className="pointer-events-none absolute -top-10 inset-x-0 h-10 bg-gradient-to-b from-primary/25 to-transparent opacity-70 blur-2xl" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 text-white mb-6 font-display group">
                            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]">medical_services</span>
                            <span className="text-xl font-bold tracking-tight">Excelcommunity Living Inc</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            Providing top-tier professional development and certification training for the next generation of healthcare heroes. Empowering care everywhere.
                        </p>
                        <div className="flex gap-4 text-slate-500">
                            <a href="#" className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">public</span>
                            </a>
                            <a href="#" className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">alternate_email</span>
                            </a>
                            <a href="#" className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">share</span>
                            </a>
                        </div>
                    </div>

                    {/* Learning */}
                    <div>
                        <h6 className="text-white font-bold mb-6">Learning</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/courses" className="hover:text-white transition-colors">Course Library</Link></li>
                            <li><Link href="/certificates" className="hover:text-white transition-colors">Certifications</Link></li>
                            <li><Link href="/courses" className="hover:text-white transition-colors">Study Guides</Link></li>
                            <li><Link href="/courses" className="hover:text-white transition-colors">CE Requirements</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h6 className="text-white font-bold mb-6">Company</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Success Stories</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h6 className="text-white font-bold mb-6">Legal</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h6 className="text-white font-bold mb-6">Support</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Community</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Webinars</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">API Docs</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-slate-800/70 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Excelcommunity Living Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-emerald-400">check_circle</span>
                            State Approved
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-sky-400">lock</span>
                            SSL Secured
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
