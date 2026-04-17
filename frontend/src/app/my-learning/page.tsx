'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import RoleGuard from '@/components/RoleGuard';
import StudentSidebar from '@/components/StudentSidebar';
import StudentHeader from '@/components/StudentHeader';
import MyCoursesTab from '@/components/MyCoursesTab';
import MyCertificatesTab from '@/components/MyCertificatesTab';

function LearningDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeTab = searchParams.get('tab') === 'certificates' ? 'certificates' : 'courses';

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Dynamic Header Props
    const headerTitle = activeTab === 'courses' ? 'My Courses' : 'My Certifications';
    const headerSubtitle = activeTab === 'courses' ? 'Track progress and continue learning' : 'Official training records and credentials.';
    const headerIcon = activeTab === 'courses' ? 'school' : 'workspace_premium';


    return (
        <RoleGuard allowedRoles={['STUDENT']}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans antialiased transition-colors duration-200 relative"
            >
                <StudentSidebar
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background-light dark:bg-background-dark">
                    <StudentHeader
                        title={headerTitle}
                        subtitle={headerSubtitle}
                        icon={headerIcon}
                        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
                    />

                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth relative">
                        <div className="max-w-6xl mx-auto flex flex-col gap-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'courses' ? <MyCoursesTab /> : <MyCertificatesTab />}
                                </motion.div>
                            </AnimatePresence>

                        </div>
                    </div>
                </main>
            </motion.div>
        </RoleGuard>
    );
}

export default function MyLearningPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-r-transparent"></div></div>}>
            <LearningDashboard />
        </Suspense>
    );
}
