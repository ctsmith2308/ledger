import { type ArchitectureDecision } from '../types';

const durableEventBus: ArchitectureDecision = {
  slug: 'durable-event-bus',
  title: 'Durable event bus with async dispatch',
  subtitle:
    'Every event hits Postgres before any handler runs. QStash handles async delivery.',
  badge: 'Infrastructure',
  context:
    'The original in-process event bus dispatched events directly to handlers in memory. If the process crashed between persisting an aggregate and dispatching its events, the events were lost. The rollup would never update, the budget check would never run. In a fintech domain, silent data loss in the event pipeline is not acceptable.',
  decision:
    'The `EventBus` persists every event to a `domain_events` table in Postgres, then publishes to QStash for async handler execution. A webhook endpoint (`/api/events`) receives the message and calls `eventBus.process()`, which runs handlers sequentially and marks the event as processed or failed. The table is append-only and serves three roles: durable delivery guarantee, audit trail, and failure tracking.',
  rationale: [
    'Persist-first guarantees no event is lost. If the process crashes after the write but before the QStash publish, the event exists in the database and can be replayed.',
    'The `domain_events` table is the audit trail. In a fintech application, knowing what happened and when is a compliance concern. Every event is queryable by aggregate, type, status, and timestamp.',
    'Failed handlers are tracked with attempt count and error message. A `replayFailed()` method retries events under the max attempt threshold. Every error is visible in the database and logs.',
    'QStash decouples the event write from handler execution. The HTTP request that triggered the event returns immediately after persisting and publishing. Handlers run asynchronously via the webhook.',
  ],
  tradeoffs: [
    {
      pro: 'Every event is persisted before handlers run. Crash-safe, replayable, auditable.',
      con: 'Every event adds a database write plus a QStash publish before returning. At high throughput this adds latency.',
    },
    {
      pro: 'The `domain_events` table is queryable. Event history, failure rates, and processing latency are all SQL queries away.',
      con: 'The table grows with every event. Needs a retention policy to archive or purge processed events on a schedule.',
    },
    {
      pro: 'Async dispatch via QStash means handler failures do not block the original request.',
      con: 'QStash is an external dependency. If it is unavailable, events are persisted but handler execution is delayed.',
    },
  ],
  codeBlocks: [
    {
      label: 'EventBus. Persist, publish to QStash, process via webhook',
      code: `class EventBus implements IEventBus {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qstash: Client,
    private readonly appUrl: string,
  ) {}

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      // 1. Persist to domain_events table (status: "pending")
      const record = await this._persist(event);
      // 2. Publish to QStash, which calls /api/events
      await this._publish(event, record.id);
    }
  }

  async process(event: DomainEvent, recordId: string): Promise<void> {
    // Run handlers sequentially
    // On success: status -> "processed"
    // On failure: status -> "failed", attempts++, error logged
  }

  async replayFailed(): Promise<number> {
    // Pick up failed events under MAX_ATTEMPTS, retry in order
  }
}`,
    },
    {
      label: 'Event store schema. Append-only, indexed for queries',
      code: `model DomainEventRecord {
  id          String    @id @default(uuid())
  aggregateId String    @map("aggregate_id")
  eventType   String    @map("event_type")
  payload     Json
  status      String    @default("pending") // "pending" | "processed" | "failed"
  attempts    Int       @default(0)
  error       String?
  createdAt   DateTime  @default(now()) @map("created_at")
  processedAt DateTime? @map("processed_at")

  @@index([eventType, status])
  @@index([aggregateId])
  @@index([createdAt])
  @@schema("events")
  @@map("domain_events")
}`,
    },
    {
      label: 'Observability. SQL queries replace broker dashboards',
      code: `-- What failed and why?
SELECT event_type, error, attempts
FROM events.domain_events
WHERE status = 'failed';

-- Processing latency by event type
SELECT event_type,
  avg(processed_at - created_at) as avg_latency
FROM events.domain_events
WHERE status = 'processed'
GROUP BY event_type;`,
    },
  ],
};

export { durableEventBus };
