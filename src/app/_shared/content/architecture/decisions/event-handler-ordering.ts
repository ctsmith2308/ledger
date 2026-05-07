import { type ArchitectureDecision } from '../types';

const eventHandlerOrdering: ArchitectureDecision = {
  slug: 'event-handler-ordering',
  title: 'Event handler ordering',
  subtitle:
    'Registration order is implicit coupling. It works because processing is sequential. An explicit event chain would make the dependency visible.',
  badge: 'Infrastructure',
  context:
    'When a `TransactionCreated` event fires, the budgets module\'s `recordSpend` handler checks the rollup against budget limits to detect threshold breaches. The rollup was previously materialised by a separate event handler (`updateCategoryRollup`) that had to run first — creating an implicit ordering dependency. This was resolved by moving rollup upserts inline into the sync handler, so the rollup is always fresh before events dispatch.',
  decision:
    'Category rollups are now upserted inline during sync, before events dispatch. The `recordSpend` handler (budgets module) is the only remaining `TransactionCreated` subscriber and reads from a rollup that is guaranteed to be current. The previous implicit ordering dependency between two event handlers no longer exists.',
  rationale: [
    'Inline rollup upserts guarantee the read model is current before events dispatch. No race condition possible.',
    'The event bus still processes handlers sequentially, which matters if multiple cross-module handlers subscribe to the same event in the future.',
    'The previous extraction path (intermediate `rollup.updated` event) is no longer needed since the ordering dependency was eliminated at the source.',
  ],
  tradeoffs: [
    {
      pro: 'The ordering guarantee comes free from sequential processing. No queues, no retry logic, no dead-letter handling.',
      con: 'The ordering dependency is implicit in registration order, not explicit in the code. A developer reordering module initialisation could break the guarantee without a compiler warning.',
    },
    {
      pro: 'Sequential processing is simple to reason about. Each handler runs to completion before the next starts.',
      con: 'A slow handler blocks all downstream handlers for that event. No parallelism for independent handlers that could safely run concurrently.',
    },
  ],
  codeBlocks: [
    {
      label: 'Sequential processing. Handlers run in registration order',
      code: `// EventBus.process() runs handlers sequentially via the webhook
async process(event: DomainEvent, recordId: string): Promise<void> {
  const handlers = this._handlers.get(event.eventType) ?? [];

  for (const handler of handlers) {
    await handler(event); // completes before next handler starts
  }

  // On success: status -> "processed"
  // On failure: status -> "failed", attempts++, error logged
}`,
    },
    {
      label: 'Inline rollup eliminates ordering dependency',
      code: `// SyncTransactionsHandler: upserts rollups inline after saving
await this.transactionRepository.saveMany(transactions);
await this._upsertRollups(transactions);

// Events dispatch AFTER rollups are written
if (batchEvents.length > 0) {
  await this.eventBus.dispatch(batchEvents);
}

// budgets/api/index.ts — only remaining subscriber
// Reads from a rollup guaranteed to be current
eventBus.register(
  TransactionEvents.TRANSACTION_CREATED,
  createRecordSpendHandler(
    repos.budgetRepository,
    repos.categoryRollupRepository,
    eventBus,
  ),
);`,
    },
  ],
};

export { eventHandlerOrdering };
