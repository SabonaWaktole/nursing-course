import CourseClient from './CourseClient';
import { Suspense } from 'react';

export function generateStaticParams() {
    return [{ id: 'dummy' }];
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading course...</div>}>
            <CourseClient />
        </Suspense>
    );
}
