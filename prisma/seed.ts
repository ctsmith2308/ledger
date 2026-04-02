import 'dotenv/config';
import { PrismaClient } from '@generated-prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import argon2id from 'argon2';

import { FEATURE_KEYS } from '../src/core/shared/domain/constants/feature-flag.constants';
import { TRANSACTION_CATEGORIES as TC } from '../src/core/shared/domain/constants/transaction-category.constants';
import { USER_TIERS } from '../src/core/shared/domain/constants/user-tier.constants';

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
      update: { email: 'chris@ledger.app', passwordHash },
      create: {
        id: 'a0000000-0000-0000-0000-000000000001',
        email: 'chris@ledger.app',
        passwordHash,
        tier: USER_TIERS.DEMO,
        profile: {
          create: {
            firstName: 'Chris',
            lastName: 'Smith',
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
        tier: USER_TIERS.DEMO,
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
        tier: USER_TIERS.DEMO,
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
    {
      userId: 'a0000000-0000-0000-0000-000000000001',
      category: TC.FOOD_AND_DRINK,
      monthlyLimit: 500,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000001',
      category: TC.TRANSPORTATION,
      monthlyLimit: 200,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000001',
      category: TC.ENTERTAINMENT,
      monthlyLimit: 150,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000001',
      category: TC.SHOPPING,
      monthlyLimit: 300,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000001',
      category: TC.RENT_AND_UTILITIES,
      monthlyLimit: 1800,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000001',
      category: TC.HEALTH_AND_FITNESS,
      monthlyLimit: 100,
    },

    {
      userId: 'a0000000-0000-0000-0000-000000000002',
      category: TC.FOOD_AND_DRINK,
      monthlyLimit: 400,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000002',
      category: TC.TRANSPORTATION,
      monthlyLimit: 150,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000002',
      category: TC.ENTERTAINMENT,
      monthlyLimit: 200,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000002',
      category: TC.SHOPPING,
      monthlyLimit: 250,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000002',
      category: TC.RENT_AND_UTILITIES,
      monthlyLimit: 2200,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000002',
      category: TC.EDUCATION,
      monthlyLimit: 300,
    },

    {
      userId: 'a0000000-0000-0000-0000-000000000003',
      category: TC.FOOD_AND_DRINK,
      monthlyLimit: 600,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000003',
      category: TC.TRANSPORTATION,
      monthlyLimit: 250,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000003',
      category: TC.ENTERTAINMENT,
      monthlyLimit: 100,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000003',
      category: TC.SHOPPING,
      monthlyLimit: 350,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000003',
      category: TC.RENT_AND_UTILITIES,
      monthlyLimit: 1500,
    },
    {
      userId: 'a0000000-0000-0000-0000-000000000003',
      category: TC.LOAN_PAYMENTS,
      monthlyLimit: 450,
    },
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

  // ─── Feature Flags ──────────────────────────────────────────────────

  const features = Object.values(FEATURE_KEYS);
  const tiers = [
    { tier: USER_TIERS.DEMO, enabled: false },
    { tier: USER_TIERS.TRIAL, enabled: true },
    { tier: USER_TIERS.FULL, enabled: true },
  ];

  const featureFlagRows = tiers.flatMap(({ tier, enabled }) =>
    features.map((feature) => ({ tier, feature, enabled })),
  );

  const flags = await Promise.all(
    featureFlagRows.map((row) =>
      prisma.featureFlag.upsert({
        where: { tier_feature: { tier: row.tier, feature: row.feature } },
        update: { enabled: row.enabled },
        create: row,
      }),
    ),
  );

  flags.forEach((f: unknown) => console.log('Seeded feature flag:', f));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
