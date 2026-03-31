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
    prisma.user.upsert({
      where: { id: 'a0000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: 'a0000000-0000-0000-0000-000000000001',
        email: 'demo@ledger.app',
        passwordHash,
        tier: 'DEMO',
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
    prisma.user.upsert({
      where: { id: 'a0000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: 'a0000000-0000-0000-0000-000000000002',
        email: 'alice@ledger.app',
        passwordHash,
        tier: 'DEMO',
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
    prisma.user.upsert({
      where: { id: 'a0000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: 'a0000000-0000-0000-0000-000000000003',
        email: 'ben@ledger.app',
        passwordHash,
        tier: 'DEMO',
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

  const demoBudgets = [
    { userId: 'a0000000-0000-0000-0000-000000000001', category: 'FOOD_AND_DRINK', monthlyLimit: 500 },
    { userId: 'a0000000-0000-0000-0000-000000000001', category: 'TRANSPORTATION', monthlyLimit: 200 },
    { userId: 'a0000000-0000-0000-0000-000000000001', category: 'ENTERTAINMENT', monthlyLimit: 150 },
    { userId: 'a0000000-0000-0000-0000-000000000001', category: 'SHOPPING', monthlyLimit: 300 },
    { userId: 'a0000000-0000-0000-0000-000000000001', category: 'RENT_AND_UTILITIES', monthlyLimit: 1800 },
    { userId: 'a0000000-0000-0000-0000-000000000001', category: 'HEALTH_AND_FITNESS', monthlyLimit: 100 },

    { userId: 'a0000000-0000-0000-0000-000000000002', category: 'FOOD_AND_DRINK', monthlyLimit: 400 },
    { userId: 'a0000000-0000-0000-0000-000000000002', category: 'TRANSPORTATION', monthlyLimit: 150 },
    { userId: 'a0000000-0000-0000-0000-000000000002', category: 'ENTERTAINMENT', monthlyLimit: 200 },
    { userId: 'a0000000-0000-0000-0000-000000000002', category: 'SHOPPING', monthlyLimit: 250 },
    { userId: 'a0000000-0000-0000-0000-000000000002', category: 'RENT_AND_UTILITIES', monthlyLimit: 2200 },
    { userId: 'a0000000-0000-0000-0000-000000000002', category: 'EDUCATION', monthlyLimit: 300 },

    { userId: 'a0000000-0000-0000-0000-000000000003', category: 'FOOD_AND_DRINK', monthlyLimit: 600 },
    { userId: 'a0000000-0000-0000-0000-000000000003', category: 'TRANSPORTATION', monthlyLimit: 250 },
    { userId: 'a0000000-0000-0000-0000-000000000003', category: 'ENTERTAINMENT', monthlyLimit: 100 },
    { userId: 'a0000000-0000-0000-0000-000000000003', category: 'SHOPPING', monthlyLimit: 350 },
    { userId: 'a0000000-0000-0000-0000-000000000003', category: 'RENT_AND_UTILITIES', monthlyLimit: 1500 },
    { userId: 'a0000000-0000-0000-0000-000000000003', category: 'LOAN_PAYMENTS', monthlyLimit: 450 },
  ];

  const budgets = await Promise.all(
    demoBudgets.map((b) =>
      prisma.budget.upsert({
        where: {
          userId_category: { userId: b.userId, category: b.category },
        },
        update: {},
        create: b,
      }),
    ),
  );

  budgets.forEach((b: unknown) => console.log('Seeded budget:', b));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
