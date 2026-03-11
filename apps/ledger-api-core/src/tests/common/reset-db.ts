import { PrismaService } from '@/shared/infrastructure/persistence';

const prisma = new PrismaService();

async function resetDb() {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    // add other tables here as your schema grows
  ]);
}

export { resetDb };
