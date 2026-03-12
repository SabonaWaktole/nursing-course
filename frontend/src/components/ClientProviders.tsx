'use client';

import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { usePageVariants } from '@/lib/motion';

export default function ClientProviders({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    // Routes that have their own sidebar + header layout — hide global Navbar & Footer
    const hasDashboardLayout = pathname?.startsWith('/admin') || pathname?.startsWith('/my-courses') || pathname?.startsWith('/certificates') || pathname?.startsWith('/settings');
    const pageVariants = usePageVariants();

    return (
        <AuthProvider>
            {!hasDashboardLayout && <Navbar />}
            <main className={!hasDashboardLayout ? "min-h-screen" : "h-screen overflow-hidden"}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        variants={pageVariants}
                        initial="hidden"
                        animate="enter"
                        exit="exit"
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
            {!hasDashboardLayout && <Footer />}
        </AuthProvider>
    );
}
