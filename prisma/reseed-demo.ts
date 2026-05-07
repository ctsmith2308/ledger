import 'dotenv/config';
import { PrismaClient } from '@generated-prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PlaidApi, Configuration, PlaidEnvironments, Products } from 'plaid';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const plaidApi = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }),
);

const DEMO_USERS = [
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
];

const SANDBOX_INSTITUTION = 'ins_109508';

async function clearDemoData() {
  console.log('Clearing existing demo data...');

  await prisma.transaction.deleteMany({
    where: { userId: { in: DEMO_USERS } },
  });

  await prisma.categoryRollup.deleteMany({
    where: { userId: { in: DEMO_USERS } },
  });

  await prisma.bankAccount.deleteMany({
    where: { plaidItem: { userId: { in: DEMO_USERS } } },
  });

  await prisma.plaidItem.deleteMany({
    where: { userId: { in: DEMO_USERS } },
  });

  console.log('  Cleared transactions, accounts, and items.');
}

async function seedDemoUser(userId: string) {
  console.log(`\nSeeding Plaid data for user: ${userId}`);

  const publicTokenResponse = await plaidApi.sandboxPublicTokenCreate({
    institution_id: SANDBOX_INSTITUTION,
    initial_products: [Products.Transactions],
  });

  const publicToken = publicTokenResponse.data.public_token;

  const exchangeResponse = await plaidApi.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const { access_token: accessToken, item_id: itemId } = exchangeResponse.data;

  console.log(`  Linked item: ${itemId}`);

  await prisma.plaidItem.create({
    data: {
      id: itemId,
      userId,
      accessToken,
      institutionId: SANDBOX_INSTITUTION,
    },
  });

  const accountsResponse = await plaidApi.accountsGet({
    access_token: accessToken,
  });

  const accounts = accountsResponse.data.accounts;

  console.log(`  Found ${accounts.length} accounts`);

  for (const account of accounts) {
    await prisma.bankAccount.create({
      data: {
        id: account.account_id,
        plaidItemId: itemId,
        name: account.name,
        officialName: account.official_name ?? null,
        mask: account.mask ?? null,
        type: account.type,
        subtype: account.subtype ?? null,
        availableBalance: account.balances.available ?? null,
        currentBalance: account.balances.current ?? null,
        currencyCode: account.balances.iso_currency_code ?? 'USD',
      },
    });
  }

  console.log('  Waiting for sandbox transactions to populate...');
  await new Promise((resolve) => setTimeout(resolve, 10000));

  let cursor: string | undefined;
  let hasMore = true;
  let totalAdded = 0;
  let retries = 0;
  const MAX_RETRIES = 3;

  while (hasMore) {
    try {
      const syncResponse = await plaidApi.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined,
        options: { include_personal_finance_category: true },
      });

      const data = syncResponse.data;
      retries = 0;

      for (const txn of data.added) {
        await prisma.transaction.upsert({
          where: { id: txn.transaction_id },
          update: {},
          create: {
            id: txn.transaction_id,
            accountId: txn.account_id,
            userId,
            amount: txn.amount,
            date: new Date(txn.date),
            name: txn.name,
            merchantName: txn.merchant_name ?? null,
            category: txn.personal_finance_category?.primary ?? null,
            detailedCategory: txn.personal_finance_category?.detailed ?? null,
            pending: txn.pending,
            paymentChannel: txn.payment_channel ?? null,
          },
        });
      }

      totalAdded += data.added.length;
      cursor = data.next_cursor;
      hasMore = data.has_more;
    } catch (error) {
      retries++;
      if (retries > MAX_RETRIES) throw error;
      console.log(`  Sync failed, retrying (${retries}/${MAX_RETRIES})...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  await prisma.plaidItem.update({
    where: { id: itemId },
    data: { cursor: null },
  });

  console.log(`  Synced ${totalAdded} transactions`);
  console.log(`  Cursor cleared — app resync will trigger rollup materialization`);
}

async function main() {
  await clearDemoData();

  for (const userId of DEMO_USERS) {
    await seedDemoUser(userId);
  }

  console.log('\nDemo reseed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
