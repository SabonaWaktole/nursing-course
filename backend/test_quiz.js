async function test() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const quiz = await prisma.quiz.findFirst({
            where: { moduleId: { not: null } }
        });
        
        if (!quiz) {
            console.log("No module quiz found");
            return;
        }
        
        console.log("Found quiz ID:", quiz.id);
        
        try {
            const result = await prisma.quiz.findUnique({
                where: { id: quiz.id },
                include: {
                    questions: true,
                    course: { select: { title: true } },
                },
            });
            console.log("Prisma query result:", !!result);
            if (result) {
                console.log("Questions length:", result.questions.length);
                console.log("First question options:", result.questions[0].options);
            }
        } catch (dbErr) {
            console.error("Prisma query error:", dbErr);
        }
        
        prisma.$disconnect();
    } catch (e) {
        console.error(e);
    }
}
test();
