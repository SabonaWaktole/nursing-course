import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { title: 'death' }, select: { instructorId: true }
  });
  console.log('COURSE INSTRUCTOR:', course?.instructorId);

  const admin1 = await prisma.user.findFirst({ where: { name: 'Emily Kukiriza' }, select: { id: true} });
  console.log('EMILY ID:', admin1?.id);
  
  const admin2 = await prisma.user.findFirst({ where: { name: 'Paul Killerman' }, select: { id: true} });
  console.log('PAUL ID:', admin2?.id);
}

main().finally(() => prisma.$disconnect());
