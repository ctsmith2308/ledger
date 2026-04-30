import { PrismaService } from './prisma.service';

/**
 * Prisma singleton. Prevents multiple client instances during Next.js
 * hot reload in development (HMR re-evaluates modules but globalThis
 * persists). In production a single instance is created and reused for
 * the process lifetime.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaService };

const prisma = globalForPrisma.prisma ?? new PrismaService();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
