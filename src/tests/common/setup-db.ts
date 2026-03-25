import { beforeEach, afterAll } from 'vitest';
import { PrismaService } from '@/core/shared/infrastructure';

const prisma = new PrismaService();

const _cleanDatabase = async () => {
  await prisma.userSession.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
};

beforeEach(async () => {
  await _cleanDatabase();
});

afterAll(async () => {
  await _cleanDatabase();
  await prisma.$disconnect();
});

export { prisma };
