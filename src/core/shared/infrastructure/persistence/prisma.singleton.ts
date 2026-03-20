import { PrismaService } from './prisma.service';

// Prevents multiple Prisma instances during Next.js hot reload in development.
// In production a single instance is created and reused for the process lifetime.
const globalForPrisma = globalThis as unknown as { prisma: PrismaService };

const prisma = globalForPrisma.prisma ?? new PrismaService();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
