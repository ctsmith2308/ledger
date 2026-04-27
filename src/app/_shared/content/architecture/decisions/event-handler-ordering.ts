import { type ArchitectureDecision } from '../types';

const eventHandlerOrdering: ArchitectureDecision = {
  slug: 'event-handler-ordering',
  title: 'Event handler ordering',
  subtitle:
    'Registration order is implicit coupling. It works because processing is sequential. An explicit event chain would make the dependency visible.',
  badge: 'Infrastructure',
  context:
    'When a `TransactionCreated` event fires, two handlers respond: `updateCategoryRollup` (transactions module) materialises the read model, and `recordSpend` (budgets module) checks the rollup against budget limits to detect threshold breaches. The second handler depends on the first having completed because it reads from the rollup that the first handler writes. Running them in parallel would create a race condition where `recordSpend` reads stale data.',
  decision:
    'The `EventBus.process()` method runs handlers sequentially in registration order. The transactions module registers `updateCategoryRollup` before the budgets module registers `recordSpend`, so the rollup is always fresh when the spend check runs. This is an implicit ordering guarantee. It works because module initialisation order is deterministic and controlled in the composition root.',
  rationale: [
    'Sequential processing eliminates the race condition. The rollup write completes before the spend check reads.',
    'Registration order is deterministic. Modules initialise in a fixed order in the composition root. The dependency is implicit but stable.',
    'If the ordering needs to become explicit, the extraction path is to introduce an intermediate event (`rollup.updated`) so each handler reacts to its actual precondition.',
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
      label: 'Registration order. Transactions before budgets',
      code: `// transactions/api/index.ts registers first
eventBus.register(
  TransactionEvents.TRANSACTION_CREATED,
  createUpdateCategoryRollupHandler(repos.categoryRollupRepository),
);

// budgets/api/index.ts registers second, reads from fresh rollup
eventBus.register(
  TransactionEvents.TRANSACTION_CREATED,
  createRecordSpendHandler(
    repos.budgetRepository,
    repos.categoryRollupRepository,
    eventBus,
  ),
);`,
    },
    {
      label:
        'Extraction path. Explicit event chain replaces implicit ordering',
      code: `// Break the implicit dependency with an intermediate event:
//
// 1. updateCategoryRollup subscribes to "transaction.created"
// 2. After writing the rollup, it publishes "rollup.updated"
// 3. recordSpend subscribes to "rollup.updated", not "transaction.created"
//
// Each handler reacts to the event that represents its precondition.
// No ordering dependency. No implicit coupling.
//
// transaction.created -> updateCategoryRollup -> rollup.updated -> recordSpend`,
    },
  ],
};

export { eventHandlerOrdering };
