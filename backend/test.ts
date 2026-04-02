import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { title: 'death' }
  });
  console.log('COURSE =>', course);

  const admin1 = await prisma.user.findFirst({ where: { name: 'Emily Kukiriza' } });
  console.log('Emily Admin ID:', admin1?.id);

  const certs = await prisma.certificate.findMany({
    where: { courseId: course?.id }
  });
  console.log('Certificates:', certs);
}

main().finally(() => prisma.$disconnect());
