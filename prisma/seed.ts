import 'dotenv/config';
import { PrismaClient } from '@generated-prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import argon2id from 'argon2';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await argon2id.hash('Password@123!', {
    hashLength: 50,
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'a0000000-0000-0000-0000-000000000001',
        email: 'demo@ledger.app',
        passwordHash,
        profile: {
          create: {
            firstName: 'Demo',
            lastName: 'User',
            timezone: 'America/Denver',
            currency: 'USD',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'a0000000-0000-0000-0000-000000000002',
        email: 'alice@ledger.app',
        passwordHash,
        profile: {
          create: {
            firstName: 'Alice',
            lastName: 'Rivera',
            timezone: 'America/New_York',
            currency: 'USD',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        id: 'a0000000-0000-0000-0000-000000000003',
        email: 'ben@ledger.app',
        passwordHash,
        profile: {
          create: {
            firstName: 'Ben',
            lastName: 'Carter',
            timezone: 'America/Denver',
            currency: 'USD',
          },
        },
      },
    }),
  ]);

  users.forEach((u: unknown) => console.log('Seeded user:', u));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
