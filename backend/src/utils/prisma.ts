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

// Shutdown is orchestrated centrally in server.ts (HTTP server drains first,
// then this client disconnects) so we don't race two independent exit paths.

export default prisma;
