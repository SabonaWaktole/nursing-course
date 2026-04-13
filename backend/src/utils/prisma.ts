import { PrismaClient } from '@prisma/client';

// Production-grade Prisma singleton
// Prevents multiple instances from being created (especially during dev hot-reload)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown — release DB connections on process exit
const shutdown = async () => {
  console.log('🔌 Disconnecting Prisma client...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default prisma;
