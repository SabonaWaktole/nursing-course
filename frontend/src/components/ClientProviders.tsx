'use client';

import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ReactNode } from 'react';

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
        </AuthProvider>
    );
}
