const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const course = await prisma.course.update({
            where: { id: '3d9bc705-0486-4ed9-b3a0-72e5736ae2ab' },
            data: { 
                title: 'Test', 
                description: 'Test', 
                price: undefined, 
                thumbnail: '/uploads/thumbnails/test.jpg', 
                category: 'Nursing', 
                tags: [] 
            },
        });
        console.log("Success:", course);
    } catch (err) {
        console.error("Error updating:", err);
    } finally {
        await prisma.$disconnect();
    }
}
test();
