'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { footerContainerVariants, footerItemVariants, viewportOnce } from '@/lib/motion';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-10 border-t border-slate-800/80 relative overflow-hidden">
            {/* Animated gradient top border */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-gradient-shift" />
            <div className="pointer-events-none absolute -top-10 inset-x-0 h-20 bg-gradient-to-b from-primary/20 to-transparent opacity-60 blur-2xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={footerContainerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={viewportOnce}
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-12"
                >
                    {/* Brand */}
                    <motion.div variants={footerItemVariants} className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 text-white mb-6 font-display group">
                            <motion.span
                                whileHover={{ rotate: 8, scale: 1.1 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_18px_rgba(56,189,248,0.7)]"
                            >
                                medical_services
                            </motion.span>
                            <span className="text-xl font-bold tracking-tight">Excel Community Living Inc</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-6">
                            Providing top-tier professional development and certification training for the next generation of healthcare heroes. Empowering care everywhere.
                        </p>
                        <div className="flex gap-4 text-slate-500">
                            {[
                                { icon: 'public', label: 'Website' },
                                { icon: 'alternate_email', label: 'Email' },
                                { icon: 'share', label: 'Share' },
                            ].map((item) => (
                                <motion.a
                                    key={item.icon}
                                    href="#"
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="hover:text-primary transition-colors relative group"
                                    aria-label={item.label}
                                >
                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-150 transition-transform duration-300 -z-10" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Learning */}
                    <motion.div variants={footerItemVariants}>
                        <h6 className="text-white font-bold mb-6">Learning</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/courses" className="link-animated hover:text-white transition-colors">Course Library</Link></li>
                            <li><Link href="/certificates" className="link-animated hover:text-white transition-colors">Certifications</Link></li>
                            <li><Link href="/courses" className="link-animated hover:text-white transition-colors">Study Guides</Link></li>
                            <li><Link href="/courses" className="link-animated hover:text-white transition-colors">CE Requirements</Link></li>
                        </ul>
                    </motion.div>

                    {/* Company */}
                    <motion.div variants={footerItemVariants}>
                        <h6 className="text-white font-bold mb-6">Company</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">Success Stories</Link></li>
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div variants={footerItemVariants}>
                        <h6 className="text-white font-bold mb-6">Legal</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/privacy" className="link-animated hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="link-animated hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund" className="link-animated hover:text-white transition-colors">Refund Policy</Link></li>
                        </ul>
                    </motion.div>

                    {/* Support */}
                    <motion.div variants={footerItemVariants}>
                        <h6 className="text-white font-bold mb-6">Support</h6>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">Community</Link></li>
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">Webinars</Link></li>
                            <li><Link href="/" className="link-animated hover:text-white transition-colors">API Docs</Link></li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="pt-6 border-t border-slate-800/70 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500"
                >
                    <p>© {new Date().getFullYear()} Excel Community Living Inc. All rights reserved.</p>
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
                </motion.div>
            </div>
        </footer>
    );
}
