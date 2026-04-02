import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@generated-prisma/client';

class PrismaService extends PrismaClient {
  constructor() {
    const prismaConfig = { connectionString: process.env.DATABASE_URL };

    const adapter = new PrismaPg(prismaConfig);

    super({ adapter });
  }
}

export { PrismaService };
