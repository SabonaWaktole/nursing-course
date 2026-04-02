import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function wipe() {
  const rs = await prisma.notification.deleteMany();
  console.log(`Wiped ${rs.count} old notifications!`);
}

wipe().finally(() => prisma.$disconnect());
