import QuizClient from './QuizClient';

export function generateStaticParams() {
    return [{ quizId: 'dummy' }];
}

export default function QuizPage({ params }: { params: { quizId: string } }) {
    return <QuizClient />;
}
