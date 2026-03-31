import { type ArchitectureDecision } from '../types';

const modularMonolith: ArchitectureDecision = {
  slug: 'modular-monolith',
  title: 'Modular monolith over microservices',
  subtitle:
    "Service boundaries drawn too early are a bet on requirements you don't have yet.",
  badge: 'System design',
  context:
    'Microservices are a default architectural choice in many senior engineering conversations. The assumption is that distributed systems are the "correct" answer for serious applications. But microservices introduce real costs — network overhead, distributed tracing, deployment complexity, and eventual consistency — that are only justified when the domain boundaries are well understood and the team is large enough to own separate services.',
  decision:
    'Build a modular monolith. Domain boundaries are enforced at the module level with explicit dependency wiring and no cross-module imports. Each module owns its domain, application, and infrastructure layers. The event bus handles cross-module communication without tight coupling. Splitting into services later is a deployment decision, not an architectural rewrite.',
  rationale: [
    "Domain boundaries are hard to get right on the first pass. A modular monolith lets you refine them cheaply — a microservice boundary is expensive to move once it's a network contract.",
    'The IEventBus interface means cross-module communication is already decoupled. The DurableEventBus persists events to Postgres before dispatch. Swapping to an external broker (SQS, Redis Streams) for multi-instance fan-out is an infrastructure change with no domain impact.',
    'Manual dependency wiring — concrete infrastructure classes are imported and constructed directly in each command and query index file. The full dependency graph is visible at compile time. There are no IoC container surprises, no runtime injection failures, and TypeScript catches missing dependencies before the app starts.',
    'A single deployment unit is dramatically simpler to operate at this scale — one database connection, one process, one set of logs, one deploy pipeline.',
  ],
  tradeoffs: [
    {
      pro: 'One deployment unit — no distributed tracing, no network partitions, no inter-service auth.',
      con: 'A single runaway query or memory leak can affect all modules. Isolation requires process-level separation eventually.',
    },
    {
      pro: 'Domain boundaries can be refined cheaply before they become network contracts.',
      con: 'Module boundary discipline requires convention, not enforcement. A careless import can couple modules without a compiler warning.',
    },
    {
      pro: 'The DurableEventBus persists every event to Postgres before handler execution — crash-safe, replayable, and auditable without an external broker.',
      con: 'Still single-process dispatch. Multi-instance fan-out requires an external broker (SQS, Redis Streams). The IEventBus interface preserves the swap path.',
    },
  ],
  codeBlocks: [
    {
      label: 'Module structure — each module owns its full slice',
      code: `src/core/modules/identity/
  domain/          # pure business rules, no infra dependencies
  application/     # commands, queries, handlers
    commands/
      login-user/  # self-contained: command + handler + registration
      register-user/
  infrastructure/  # adapters — repository, services
  identity.module.ts  # side-effect imports trigger registration`,
    },
    {
      label: 'Cross-module communication via IEventBus',
      code: `// Domain layer defines the interface — no infra dependency
interface IEventBus {
  dispatch(events: DomainEvent[]): Promise<void>;
}

// Today: DurableEventBus — Postgres persistence + in-process dispatch
const eventBus = new DurableEventBus(prisma);

// Tomorrow: swap one line, zero domain changes
const eventBus = new SqsEventBus(sqsClient, queueUrl);`,
    },
  ],
};

export { modularMonolith };
