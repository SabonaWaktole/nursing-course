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
    const isAdminMode = pathname?.startsWith('/admin');
    const pageVariants = usePageVariants();

    return (
        <AuthProvider>
            {!isAdminMode && <Navbar />}
            <main className={!isAdminMode ? "min-h-screen" : "h-screen overflow-hidden"}>
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
            {!isAdminMode && <Footer />}
        </AuthProvider>
    );
}
