const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const course = await prisma.course.findFirst();
    console.log("Found:", course);
    
    const update = await prisma.course.update({
        where: { id: course.id },
        data: { title: course.title + ' 1' }
    });
    console.log("Updated:", update.title);
  } catch (e) {
    console.error("FAIL:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
