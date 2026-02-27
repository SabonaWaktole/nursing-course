'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles?: ('ADMIN' | 'STUDENT')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user.role as any)) {
                // Unauthorized role
                if (user.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/courses');
                }
            }
        }
    }, [user, loading, router, allowedRoles]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-r-transparent"></div>
            </div>
        );
    }

    if (!user || (allowedRoles && !allowedRoles.includes(user.role as any))) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
