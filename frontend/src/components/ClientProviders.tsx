'use client';

import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientProviders({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdminMode = pathname?.startsWith('/admin');

    return (
        <AuthProvider>
            {!isAdminMode && <Navbar />}
            <main className={!isAdminMode ? "min-h-screen" : "h-screen overflow-hidden"}>
                {children}
            </main>
            {!isAdminMode && <Footer />}
        </AuthProvider>
    );
}
