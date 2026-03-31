import { type ArchitectureDecision } from '../types';

const durableEventBus: ArchitectureDecision = {
  slug: 'durable-event-bus',
  title: 'Durable event bus — persist first, dispatch second',
  subtitle:
    'Every event hits Postgres before any handler runs. Durability and observability without an external broker.',
  badge: 'Infrastructure',
  context:
    'The original in-process event bus dispatched events directly to handlers in memory. If the process crashed between persisting an aggregate and dispatching its events, the events were lost — the rollup would never update, the budget check would never run. In a fintech domain, silent data loss in the event pipeline is not acceptable. The question was whether to add an external message broker or solve durability within the existing infrastructure.',
  decision:
    'Replace the in-process event bus with a `DurableEventBus` that persists every event to a `domain_events` table in Postgres before dispatching to handlers. The table is append-only and serves three roles: durable delivery guarantee, audit trail, and failure tracking. Handlers still run in-process and sequentially — the persistence layer wraps the existing dispatch model without changing handler code. An external message broker (Redis Streams, SQS) is the documented scaling trigger for multi-instance fan-out, not for durability.',
  rationale: [
    'Persist-first guarantees no event is lost. If the process crashes after the write but before dispatch, the event exists in the database and can be replayed. This is the same guarantee a message broker provides — achieved with infrastructure already in place.',
    'The `domain_events` table is the audit trail. In a fintech application, knowing what happened and when is a compliance concern. Every event is queryable by aggregate, type, status, and timestamp.',
    'Failed handlers are tracked with attempt count and error message. A `replayFailed()` method retries events under the max attempt threshold. No silent failures — every error is visible in the database and logs.',
    'The `IEventBus` interface is unchanged. The swap from `InProcessEventBus` to `DurableEventBus` was a single-line change in the singleton file. No module code was modified — every module already imported the shared `eventBus` singleton.',
  ],
  tradeoffs: [
    {
      pro: 'Every event is persisted before handlers run. Crash-safe, replayable, auditable.',
      con: 'Every event adds a database write before dispatch. At high throughput this adds latency and write load to Postgres.',
    },
    {
      pro: 'The `domain_events` table is queryable — event history, failure rates, processing latency are all SQL queries away.',
      con: 'The table grows with every event. Requires a retention policy — archive or purge processed events older than 30–90 days. A scheduled cleanup job or Postgres table partitioning by month keeps the table lean.',
    },
    {
      pro: 'No new infrastructure. Postgres is already the primary datastore. The event store is another schema in the same instance.',
      con: 'Still single-process dispatch. Multiple ECS instances would each run their own handlers independently. Multi-instance fan-out requires an external broker.',
    },
  ],
  codeBlocks: [
    {
      label: 'DurableEventBus — persist, then dispatch, then mark processed',
      code: `class DurableEventBus implements IEventBus {
  constructor(private readonly prisma: PrismaService) {}

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      // 1. Persist to domain_events table (status: "pending")
      const record = await this._persist(event);
      // 2. Run handlers sequentially
      // 3. On success → status: "processed"
      // 4. On failure → status: "failed", attempts++, error logged
      await this._process(event, record.id);
    }
  }

  async replayFailed(): Promise<number> {
    // Pick up failed events under MAX_ATTEMPTS, retry in order
  }
}`,
    },
    {
      label: 'Event store schema — append-only, indexed for queries',
      code: `model DomainEventRecord {
  id          String    @id @default(uuid())
  aggregateId String    @map("aggregate_id")
  eventType   String    @map("event_type")
  payload     Json
  status      String    @default("pending") // pending | processed | failed
  attempts    Int       @default(0)
  error       String?
  createdAt   DateTime  @default(now())
  processedAt DateTime?

  @@index([eventType, status])  // find pending/failed by type
  @@index([aggregateId])        // event history for an entity
  @@index([createdAt])          // retention cleanup
  @@schema("events")
}`,
    },
    {
      label: 'Observability — SQL queries replace broker dashboards',
      code: `-- What failed and why?
SELECT event_type, error, attempts
FROM events.domain_events
WHERE status = 'failed';

-- Processing latency by event type
SELECT event_type,
  avg(processed_at - created_at) as avg_latency
FROM events.domain_events
WHERE status = 'processed'
GROUP BY event_type;

-- Retention cleanup — archive processed events older than 90 days
DELETE FROM events.domain_events
WHERE status = 'processed'
  AND created_at < now() - interval '90 days';`,
    },
    {
      label: 'Scaling path — external broker replaces in-process dispatch',
      code: `// Today: DurableEventBus — Postgres persistence + in-process sequential dispatch
// Handles: durability, audit, replay, failure tracking
//
// Multi-instance trigger: Redis Streams or SQS replaces dispatch
//
// event-bus.singleton.ts — one line change
// const eventBus = new DurableEventBus(prisma);          // today
// const eventBus = new RedisStreamEventBus(redisClient);  // tomorrow
//
// Both implement IEventBus. Handler code never changes.
// DurableEventBus can run alongside as audit-only (persist, no dispatch).`,
    },
  ],
};

export { durableEventBus };
