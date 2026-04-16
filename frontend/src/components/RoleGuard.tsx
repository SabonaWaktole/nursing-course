'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles?: ('ADMIN' | 'STUDENT')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, loading, activeRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(activeRole)) {
                // Unauthorized based on activeRole
                if (activeRole === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/courses');
                }
            }
        }
    }, [user, loading, router, allowedRoles, activeRole]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
            </div>
        );
    }

    if (!user || (allowedRoles && !allowedRoles.includes(activeRole))) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
