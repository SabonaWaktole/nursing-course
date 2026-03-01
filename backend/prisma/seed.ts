import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
// IDE Refresh Poke


const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Delete in correct order to avoid foreign key violations
    console.log('🧹 Cleaning up old data...');
    await prisma.question.deleteMany();
    await prisma.result.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.course.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@excelcommunity.com' },
        update: {},
        create: {
            email: 'admin@excelcommunity.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user ready');

    // Create Course
    const course = await prisma.course.create({
        data: {
            title: 'Foundations of Nursing Assistant Care',
            description: 'Learn the essential skills and knowledge required to become a certified nursing assistant (CNA).',
            price: 199.99,
            instructorId: admin.id,
        }
    });
    console.log('✅ Course created');

    // Create Modules
    const m1 = await prisma.module.create({
        data: {
            title: 'Introduction to CNA Role',
            order: 1,
            courseId: course.id,
        }
    });

    const m2 = await prisma.module.create({
        data: {
            title: 'Safety and Infection Control',
            order: 2,
            courseId: course.id,
        }
    });
    console.log('✅ Modules created');

    // Create Lessons
    await prisma.lesson.create({
        data: { title: 'Defining the Nursing Assistant Role', moduleId: m1.id, order: 1, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
    });
    await prisma.lesson.create({
        data: { title: 'Ethics and Legal Issues', moduleId: m1.id, order: 2 }
    });
    await prisma.lesson.create({
        data: { title: 'Handwashing and Hygiene', moduleId: m2.id, order: 1, videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4' }
    });
    await prisma.lesson.create({
        data: { title: 'Safe Patient Handling', moduleId: m2.id, order: 2 }
    });

    console.log('✅ Lessons created');

    // Create Module Quiz
    await prisma.quiz.create({
        data: {
            title: 'Module 1 Proficiency Quiz',
            courseId: course.id,
            moduleId: m1.id,
            passingScore: 70,
            questions: {
                create: [
                    {
                        text: 'What is the primary role of a CNA?',
                        correctAnswer: 0,
                        options: ['Assist licensed nursing staff', 'Diagnose patients', 'Prescribe medication', 'Perform surgery']
                    },
                    {
                        text: 'Which of the following is an ethical violation?',
                        correctAnswer: 2,
                        options: ['Reporting changes', 'Patient privacy', 'Accepting cash tips', 'Handwashing']
                    }
                ]
            }
        }
    });

    // Create Final Exam
    await prisma.quiz.create({
        data: {
            title: 'CNA Certification Final Exam',
            courseId: course.id,
            moduleId: null, // Course-level exam
            passingScore: 80,
            questions: {
                create: [
                    {
                        text: 'What is the most effective way to prevent infection?',
                        correctAnswer: 1,
                        options: ['Wearing gloves', 'Hand washing', 'Using masks', 'Closing doors']
                    },
                    {
                        text: 'What does HIPAA protect?',
                        correctAnswer: 0,
                        options: ['Patient privacy', 'Insurance profits', 'Doctor salary', 'Hospital building']
                    }
                ]
            }
        }
    });

    console.log('✅ Quizzes and Exams created');

    console.log('✨ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:');
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
