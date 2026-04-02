export interface User {
    id: string;
    email: string;
    name: string;
    role: 'STUDENT' | 'ADMIN';
    createdAt?: string;
    directorName?: string | null;
    directorTitle?: string | null;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    category?: string | null;
    tag?: string | null;
    tags?: string[];
    price: number | null;
    instructorId: string;
    instructor: { id: string; name: string };
    createdAt: string;
    _count: { modules: number; quizzes: number; enrollments: number; lessons?: number };
}

export interface Module {
    id: string;
    title: string;
    order: number;
    courseId: string;
    lessons: Lesson[];
    quizzes: QuizSummary[];
    createdAt: string;
}

export interface Lesson {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    materialUrl: string | null;
    order: number;
    moduleId: string;
    createdAt: string;
}

export interface CourseDetail extends Course {
    modules: Module[];
    quizzes: QuizSummary[];
}

export interface QuizSummary {
    id: string;
    title: string;
    passingScore: number;
    courseId: string;
    moduleId?: string;
    _count: { questions: number };
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    quizId: string;
    correctAnswer?: number;
}

export interface Quiz {
    id: string;
    title: string;
    passingScore: number;
    courseId: string;
    course: { title: string };
    moduleId?: string;
    questions: Question[];
}

export interface QuizResult {
    id: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctAnswers: number;
    passingScore: number;
}

export interface Result {
    id: string;
    score: number;
    passed: boolean;
    createdAt: string;
    quiz: {
        id: string;
        title: string;
        course: { id: string; title: string };
    };
}

export interface Enrollment {
    id: string;
    progress: number;
    completed: boolean;
    createdAt: string;
    course: Course & { _count: { modules: number } };
}

export interface Certificate {
    id: string;
    uniqueId: string;
    issuedAt: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    course: { id: string; title: string };
}

export interface DashboardStats {
    stats: {
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        totalCertificates: number;
        trends: {
            users: number;
            courses: number;
            enrollments: number;
            certificates: number;
        };
        analytics: {
            avgScore: number;
            passRate: number;
            totalExams: number;
            passedExams: number;
        };
    };
    recentEnrollments: Array<{
        id: string;
        createdAt: string;
        user: { name: string; email: string };
        course: { title: string };
    }>;
}
