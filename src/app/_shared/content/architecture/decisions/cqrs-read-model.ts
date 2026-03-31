import { type ArchitectureDecision } from '../types';

const cqrsReadModel: ArchitectureDecision = {
  slug: 'cqrs-read-model',
  title: 'CQRS read model — same database, separate schema',
  subtitle:
    'A separate read model is justified. A separate database is not — yet.',
  badge: 'System design',
  context:
    'The Transactions context has fundamentally different read and write patterns. Writes enforce business rules against normalised tables — one transaction at a time, validated through the aggregate. Reads serve dashboard queries — spending rollups by category, monthly trends, budget-vs-actual comparisons. Running aggregation queries across the normalised write model on every dashboard load is wasteful and couples read performance to write-model schema decisions.',
  decision:
    'Maintain a denormalised rollup table in the same Postgres instance, materialised from domain events. The `GetSpendingByCategory` query handler reads from the rollup — not from the transactions table. A dedicated read replica is the documented scaling trigger, not a day-one requirement.',
  rationale: [
    'The rollup table is shaped exactly for the query pattern — one row per user, category, and period. Dashboard queries are single-row lookups, not aggregations across thousands of transactions.',
    'The `TransactionCreated` event handler updates the rollup incrementally. Each new transaction bumps `totalCents` and increments `transactionCount` for its category and period. The read model is eventually consistent — acceptable for a reporting-heavy domain.',
    'Same Postgres instance avoids the operational cost of a second database — no cross-database connection management, no replication lag monitoring, no separate backup strategy. The schema boundary is sufficient isolation at this scale.',
    'The extraction path is documented: when read query volume justifies it, point the query handler at a read replica. The handler code does not change — only the connection string. This is the same interface-swap pattern used throughout the project.',
  ],
  tradeoffs: [
    {
      pro: 'Dashboard queries are O(1) lookups against pre-computed data, not O(n) aggregations across transactions.',
      con: 'The rollup must be kept in sync via event handlers. A missed event means stale data until the next full recomputation.',
    },
    {
      pro: 'Same database instance — zero additional infrastructure, one connection pool, one deploy target.',
      con: 'Write-heavy bursts can still contend with read queries on shared Postgres resources. A read replica eliminates this at the cost of operational complexity.',
    },
    {
      pro: 'The event-driven materialisation pattern is the same one used with a dedicated read replica or a projection store — the code is already shaped for the next step.',
      con: 'The DurableEventBus persists events before dispatch, but a crash between rollup write and status update could cause a duplicate replay. Idempotent upserts mitigate this.',
    },
  ],
  codeBlocks: [
    {
      label: 'Rollup table — the read model schema',
      code: `// Prisma schema — denormalised, query-optimised
model CategoryRollup {
  id               String @id @default(uuid())
  userId           String @map("user_id")
  category         String
  period           String // "2026-03"
  totalCents       Int    @map("total_cents")
  transactionCount Int    @map("transaction_count")

  @@unique([userId, category, period])
  @@index([userId, period])
  @@schema("transactions_read")
  @@map("category_rollups")
}`,
    },
    {
      label:
        'Event handler — materialises the read model on TransactionCreated',
      code: `// Listens for TransactionCreated, updates the rollup incrementally
async handle(event: TransactionCreatedEvent): Promise<void> {
  await prisma.categoryRollup.upsert({
    where: {
      userId_category_period: {
        userId: event.userId,
        category: event.category,
        period: formatPeriod(event.date), // "2026-03"
      },
    },
    update: {
      totalCents: { increment: event.amountCents },
      transactionCount: { increment: 1 },
    },
    create: {
      userId: event.userId,
      category: event.category,
      period: formatPeriod(event.date),
      totalCents: event.amountCents,
      transactionCount: 1,
    },
  });
}`,
    },
    {
      label: 'Query handler — reads from rollup, not from transactions table',
      code: `// GetSpendingByCategoryHandler — hits the read model
async execute(
  query: GetSpendingByCategoryQuery,
): Promise<Result<SpendingByCategory[]>> {
  const rollups = await this.rollupRepository.findByUserAndPeriod(
    query.userId,
    query.period,
  );

  return Result.ok(rollups);
}`,
    },
  ],
};

export { cqrsReadModel };
