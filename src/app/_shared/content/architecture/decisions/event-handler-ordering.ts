import { type ArchitectureDecision } from '../types';

const eventHandlerOrdering: ArchitectureDecision = {
  slug: 'event-handler-ordering',
  title:
    'Event handler ordering — sequential dispatch with a documented extraction path',
  subtitle:
    'Registration order is implicit coupling. It works in-process. A message broker would make the dependency explicit.',
  badge: 'Infrastructure',
  context:
    'When a `TransactionCreated` event fires, two handlers respond: `updateCategoryRollup` (transactions module) materialises the read model, and `recordSpend` (budgets module) checks the rollup against budget limits to detect threshold breaches. The second handler depends on the first having completed — it reads from the rollup that the first handler writes. Running them in parallel via `Promise.all` creates a race condition where `recordSpend` reads stale data.',
  decision:
    'The in-process event bus dispatches handlers sequentially in registration order. The transactions module registers `updateCategoryRollup` before the budgets module registers `recordSpend`, so the rollup is always fresh when the spend check runs. This is an implicit ordering guarantee — it works because module initialisation order is deterministic and controlled in the composition root.',
  rationale: [
    'Sequential dispatch eliminates the race condition with zero additional infrastructure. The rollup write completes before the spend check reads.',
    'Registration order is deterministic — modules initialise in a fixed order in the composition root. The dependency is implicit but stable.',
    'The in-process bus is a stand-in for a real message broker. Sequential dispatch matches the semantics of ordered delivery (SQS FIFO, Kafka partition ordering) without the infrastructure cost.',
  ],
  tradeoffs: [
    {
      pro: 'Zero infrastructure cost — no queues, no retry logic, no dead-letter handling. The ordering guarantee is free.',
      con: 'The ordering dependency is implicit in registration order, not explicit in the code. A developer reordering module initialisation could break the guarantee without a compiler warning.',
    },
    {
      pro: 'Sequential dispatch is simple to reason about — each handler runs to completion before the next starts.',
      con: 'A slow handler blocks all downstream handlers for that event. No parallelism for independent handlers that could safely run concurrently.',
    },
    {
      pro: 'The pattern maps directly to message broker semantics — swapping to SQS FIFO or Kafka ordered partitions requires no handler changes.',
      con: 'The current approach conflates two concerns (rollup materialisation and budget checking) into one event subscription. A message broker would separate them more cleanly.',
    },
  ],
  codeBlocks: [
    {
      label: 'Sequential dispatch — handlers run in registration order',
      code: `// DurableEventBus — sequential, not parallel
async dispatch(events: DomainEvent[]): Promise<void> {
  for (const event of events) {
    const handlers = this._handlers.get(event.eventType) ?? [];
    for (const handler of handlers) {
      await handler(event); // completes before next handler starts
    }
  }
}`,
    },
    {
      label: 'Registration order — transactions before budgets',
      code: `// transactions/index.ts — registers first
eventBus.register(
  TransactionEvents.TRANSACTION_CREATED,
  createUpdateCategoryRollupHandler(repos.categoryRollupRepository),
);

// budgets/index.ts — registers second, reads from fresh rollup
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
        'Extraction path — explicit event chain replaces implicit ordering',
      code: `// With a message broker, break the implicit dependency:
//
// 1. updateCategoryRollup subscribes to "transaction.created"
// 2. After writing the rollup, it publishes "rollup.updated"
// 3. recordSpend subscribes to "rollup.updated" — not "transaction.created"
//
// Each handler reacts to the event that represents its precondition.
// No ordering dependency. No implicit coupling.
//
// transaction.created → updateCategoryRollup → rollup.updated → recordSpend`,
    },
  ],
};

export { eventHandlerOrdering };
