import { type ArchitectureDecision } from '../types';

const modularMonolith: ArchitectureDecision = {
  slug: 'modular-monolith',
  title: 'Modular monolith over microservices',
  subtitle:
    "Service boundaries drawn too early are a bet on requirements you don't have yet.",
  badge: 'System design',
  context:
    'Microservices come up in almost every architecture discussion, but they bring real costs: network overhead, distributed tracing, deployment complexity, eventual consistency. Those costs only pay off when you actually understand your domain boundaries and have the team size to own separate services.',
  decision:
    'Build a modular monolith. Domain boundaries are enforced at the module level with explicit dependency wiring and no cross-module imports. Each module owns its domain, application, and infrastructure layers. The event bus handles cross-module communication without tight coupling. Splitting into services later is a deployment decision, not an architectural rewrite.',
  rationale: [
    "Domain boundaries are hard to get right on the first pass. A monolith lets you move them cheaply. Once a boundary becomes a network contract between services, refactoring gets expensive fast.",
    'Cross-module communication already goes through an IEventBus interface, and the DurableEventBus persists events to Postgres before dispatch. If this ever needs multi-instance fan-out, swapping to SQS or Redis Streams is an infrastructure change. Domain code stays the same.',
    'Dependencies are wired manually. Concrete infrastructure classes get imported and constructed in each command and query index file, so the full dependency graph is visible at compile time. TypeScript catches missing dependencies before the app starts. No IoC container magic.',
    'At this scale, one deployment unit keeps things simple: one database connection, one process, one set of logs, one deploy pipeline.',
  ],
  tradeoffs: [
    {
      pro: 'One deployment unit. No distributed tracing, no network partitions, no inter-service auth.',
      con: 'A runaway query or memory leak in one module can affect all of them. Real isolation eventually means separate processes.',
    },
    {
      pro: 'Domain boundaries can be refined cheaply before they become network contracts.',
      con: 'Module boundary discipline is enforced by convention, not by the compiler. A careless import can couple modules silently.',
    },
    {
      pro: 'The DurableEventBus persists every event to Postgres before handler execution, so events survive crashes and can be replayed or audited without an external broker.',
      con: 'Still single-process dispatch. Multi-instance fan-out would need an external broker (SQS, Redis Streams). The IEventBus interface keeps that swap path open.',
    },
  ],
  codeBlocks: [
    {
      label: 'Module structure. Each module owns its full slice',
      code: `src/core/modules/identity/
  domain/          # pure business rules, no infra dependencies
  application/     # commands, queries, handlers
    commands/
      login-user/  # command + handler
      register-user/
  infrastructure/  # adapters. Repository, services
  api/             # composition root + public surface
    identity.service.ts  # dispatches via bus, maps to DTOs
    identity.dto.ts
    mappers/
    index.ts       # wires deps, registers handlers, exports service
  index.ts         # thin re-export from ./api`,
    },
    {
      label: 'Cross-module communication via IEventBus',
      code: `// Domain layer defines the interface, no infra dependency
interface IEventBus {
  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void;
  dispatch(events: DomainEvent[]): Promise<void>;
}

// Today: DurableEventBus. Postgres persistence + in-process dispatch
const eventBus = new DurableEventBus(prisma);

// Tomorrow: swap one line, zero domain changes
const eventBus = new SqsEventBus(sqsClient, queueUrl);`,
    },
  ],
};

export { modularMonolith };
