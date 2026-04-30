import { type ArchitectureDecision } from '../types';

const cqrsReadModel: ArchitectureDecision = {
  slug: 'cqrs-read-model',
  title: 'CQRS read model',
  subtitle:
    'A separate read model is justified. A separate database is not, at least not yet.',
  badge: 'System design',
  context:
    'The Transactions context has fundamentally different read and write patterns. Writes enforce business rules against normalised tables, one transaction at a time, validated through the aggregate. Reads serve dashboard queries: spending rollups by category, monthly trends, budget-vs-actual comparisons. Aggregating across the normalised write model on every dashboard load is wasteful and ties read performance to write-model schema choices.',
  decision:
    'Maintain a denormalised rollup table in the same Postgres instance, built from domain events. The `GetSpendingByCategory` query handler reads from the rollup, not from the transactions table. A read replica is the scaling path when the time comes, not a day-one requirement.',
  rationale: [
    'The rollup table is shaped for the exact query pattern: one row per user, category, and period. Dashboard queries become single-row lookups instead of aggregations across thousands of transactions.',
    'The `TransactionCreated` event handler updates the rollup incrementally. Each new transaction bumps `totalCents` and increments `transactionCount` for its category and period. The read model is eventually consistent, which is fine for reporting.',
    'Keeping everything in one Postgres instance avoids the operational cost of a second database. No cross-database connection management, no replication lag monitoring, no separate backup strategy. Schema-level separation is enough isolation at this scale.',
    'When read query volume justifies it, the query handler can point at a read replica. The handler code stays the same, only the connection string changes. Same interface-swap pattern used throughout the project.',
  ],
  tradeoffs: [
    {
      pro: 'Dashboard queries are O(1) lookups against pre-computed data, not O(n) aggregations across transactions.',
      con: 'The rollup has to stay in sync via event handlers. A missed event means stale data until the next full recomputation.',
    },
    {
      pro: 'Same database instance. No additional infrastructure, one connection pool, one deploy target.',
      con: 'Write-heavy bursts can still contend with read queries on shared Postgres resources. A read replica fixes this but adds operational complexity.',
    },
    {
      pro: 'The event-driven materialisation pattern is the same one you would use with a dedicated read replica or projection store. The code is already shaped for that next step.',
      con: 'The EventBus persists events before dispatch, but a crash between the rollup write and the status update could cause a duplicate replay. Idempotent upserts handle this.',
    },
  ],
  codeBlocks: [
    {
      label: 'Rollup table. The read model schema',
      code: `// Prisma schema. Denormalised, query-optimised
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
        'Event handler. Materialises the read model on TransactionCreated',
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
      label: 'Query handler. Reads from rollup, not from transactions table',
      code: `// GetSpendingByCategoryHandler. Hits the read model
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
