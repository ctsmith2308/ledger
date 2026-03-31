type CodeBlock = {
  label: string;
  code: string;
};

type ArchitectureDecision = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  context: string;
  decision: string;
  rationale: string[];
  tradeoffs: { pro: string; con: string }[];
  codeBlocks: CodeBlock[];
};

const decisions: ArchitectureDecision[] = [
  {
    slug: 'cqrs-command-bus',
    title: 'CQRS with a typed Command Bus',
    subtitle:
      'Commands and queries are separate concerns. The bus makes dispatch type-safe without boilerplate.',
    badge: 'Application layer',
    context:
      "The original implementation wired handlers directly into an identity module object — `identityModule.loginUser.execute(dto)`. As the number of commands grew, two problems emerged: the module became a dependency magnet (every handler's dependencies had to be instantiated in one place), and call sites had to know which module owned which handler.",
    decision:
      "Introduce a CommandBus and QueryBus in the shared infrastructure layer. Each command lives in its own folder and self-registers against the bus on import. Dispatch is the only public API — callers don't need to know which handler runs.",
    rationale: [
      'Handler registration is a side effect of importing the command folder. The module file becomes three import lines instead of a dependency wiring block.',
      'Return types are inferred via a phantom field (`declare readonly _response: TResponse`) on the Command base class. No explicit generic needed at the call site — TypeScript infers it from the command instance.',
      'The `{ name: string; prototype: T }` type for the CommandClass parameter avoids both `Function` and `any` while still inferring T from the class prototype. Every class satisfies this shape automatically.',
      'Adding a new command requires one new folder. Nothing else changes — no module registration, no barrel update, no handler map.',
    ],
    tradeoffs: [
      {
        pro: 'Call sites are thin — `commandBus.dispatch(new LoginUserCommand(dto))` is the full API surface.',
        con: 'Handler registration happens as a module side effect. If the import is missing, the error is at runtime, not compile time.',
      },
      {
        pro: 'Phantom types give full response type inference without a code generator or explicit generics.',
        con: 'The phantom type pattern (`declare readonly _response`) is non-obvious to engineers unfamiliar with it.',
      },
      {
        pro: 'Each command folder is fully self-contained — command, handler, and registration in one place.',
        con: 'Each command folder constructs its own infrastructure instances. Shared state across handlers (e.g. a singleton event bus) must be imported explicitly at each wiring site.',
      },
    ],
    codeBlocks: [
      {
        label: 'Before — direct handler call',
        code: `// Call site had to know the module and handler name
const result = await identityModule.loginUser.execute(dto);`,
      },
      {
        label: 'After — bus dispatch with inferred return type',
        code: `// Return type is LoginUserResponse — inferred, no explicit generic
const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
const { jwt } = result.getValueOrThrow();`,
      },
      {
        label: 'Phantom type on the Command base class',
        code: `abstract class Command<TResponse = unknown> {
  // compile-time only — zero runtime cost
  declare readonly _response: TResponse;
}

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(readonly email: string, readonly password: string) {
    super();
  }
}`,
      },
      {
        label: 'Self-registration in the command folder index',
        code: `// commands/login-user/index.ts
import { commandBus, eventBus, prisma } from '@/core/shared/infrastructure';
import { UserRepository, UserSessionRepository } from '../../../infrastructure/repository';
import { PasswordHasher, IdGenerator } from '../../../infrastructure/services';
import { LoginUserCommand } from './login-user.command';
import { LoginUserHandler } from './login-user.handler';

commandBus.register(
  LoginUserCommand,
  new LoginUserHandler(
    new UserRepository(prisma),
    new UserSessionRepository(prisma),
    eventBus,
    PasswordHasher,
    IdGenerator,
  ),
);

export { LoginUserCommand };
export type { LoginUserResponse } from './login-user.command';`,
      },
    ],
  },
  {
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
  },
  {
    slug: 'domain-driven-design',
    title: 'Domain-Driven Design',
    subtitle:
      "A finance domain has real invariants worth modelling explicitly. A todo app wouldn't justify this.",
    badge: 'Domain layer',
    context:
      "DDD is overused as a buzzword and underused as an actual discipline. The choice to apply it here isn't fashion — it's that a personal finance domain genuinely has invariants that need enforcement. An email address isn't just a string. A password has strength requirements. A user aggregate has registration lifecycle rules. These rules belong in the domain, not scattered across handlers and validators.",
    decision:
      'Apply DDD-lite: aggregates, value objects, domain events, and repository interfaces in the domain layer. No IoC container, no decorators. Dependencies are wired explicitly. The domain knows nothing about Next.js, Prisma, or HTTP — only about business rules.',
    rationale: [
      'Value objects validate invariants at construction time. `Email.create("not-an-email")` returns `Result.fail(new InvalidEmailException())` — invalid state can never be represented.',
      'The `Result<T, E>` type makes failure explicit at every boundary. No exceptions bubble silently through the call stack; every failure path is a typed value.',
      'Repository interfaces are defined in the domain layer and implemented in infrastructure. The domain can be tested without a database — pass a mock that implements `IUserRepository`.',
      'Domain events capture what happened in business terms. Aggregate-raised events (e.g., `UserRegistered`) are pulled after persistence and dispatched via the event bus. Handler-dispatched events (e.g., `UserLoggedIn`, `LoginFailed`) are dispatched directly for use-case facts that no single aggregate owns. Both flow through the same DurableEventBus.',
      'No IoC container means the full dependency graph is visible. `RegisterUserHandler` takes `IUserRepository`, `IEventBus`, `IPasswordHasher`, `IIdGenerator` — exactly what it needs, nothing hidden.',
    ],
    tradeoffs: [
      {
        pro: 'Invalid domain state is unrepresentable — validation at construction means no defensive checks in handlers.',
        con: 'More ceremony than a simple CRUD approach. Value objects, factories, and Result types add lines of code that a junior engineer might question.',
      },
      {
        pro: 'Domain layer is fully testable without infrastructure — unit tests run in milliseconds with no database.',
        con: 'Manual wiring adds boilerplate that a DI container would eliminate. Acceptable at this scale; unwieldy at 50 modules.',
      },
      {
        pro: 'Repository interfaces make the persistence strategy swappable — Prisma today, anything else tomorrow.',
        con: 'Two mapper layers (domain → DTO, Prisma record → domain) add indirection that can feel excessive for simple read operations.',
      },
    ],
    codeBlocks: [
      {
        label: 'Value object — invalid state is unrepresentable',
        code: `class Email {
  private constructor(public readonly address: string) {}

  static create(value: string): Result<Email, InvalidEmailException> {
    const error = _validate(value);
    if (error) return Result.fail(error);
    return Result.ok(new Email(value));
  }
}

const _validate = (value: string): InvalidEmailException | null => {
  if (!value.includes('@')) return new InvalidEmailException();
  return null;
};`,
      },
      {
        label: 'Domain events — two ownership patterns',
        code: `// Aggregate-raised: the aggregate owns the state change
class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const user = new User(id, email, passwordHash);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));
    return user;
  }
}

// Handler pulls after persistence
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);

// Handler-dispatched: no aggregate owns the action
await this.eventBus.dispatch([new LoginFailedEvent(email, 'user_not_found')]);`,
      },
      {
        label:
          'Repository interface in domain, implementation in infrastructure',
        code: `// domain/repositories/user.repository.ts — no Prisma import
interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

// infrastructure/repository/user.repository.ts — Prisma lives here
class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ ... });
    return record ? UserPrismaMapper.toDomain(record) : null;
  }
}`,
      },
    ],
  },
  {
    slug: 'event-bus',
    title: 'In-process event bus',
    subtitle:
      'Domain events decouple what happened from what happens next. The interface hides the delivery mechanism.',
    badge: 'Infrastructure',
    context:
      "After a user registers, a welcome email should eventually be sent. After login, an audit log entry should be written. These are side effects — they should not be the core operation's responsibility. Putting them directly in the handler couples unrelated concerns and makes the handler harder to test.",
    decision:
      'Domain events are dispatched via an `IEventBus` interface backed by a `DurableEventBus` that persists every event to Postgres before handler execution. Events follow two ownership patterns: aggregate-raised events for state changes the aggregate owns, and handler-dispatched events for use-case-level facts that no single aggregate owns.',
    rationale: [
      "Aggregate-raised events describe the aggregate's own state change (`user.addDomainEvent(new UserRegisteredEvent(...))`). The handler pulls them after persistence and dispatches them via the bus.",
      'Handler-dispatched events describe use-case facts — login failures, logouts, account deletions — where no single aggregate owns the action. The handler dispatches directly via `eventBus.dispatch()`.',
      'Events are pulled or dispatched after the operation succeeds, not before. This avoids dispatching events for operations that fail to persist.',
      'The `IEventBus` interface in the domain layer means the domain has zero knowledge of how events are delivered. In tests, pass a mock or no-op implementation.',
      "Handler registration (`eventBus.register(IdentityEvents.USER_REGISTERED, sendWelcomeEmail)`) is additive — new side effects don't touch existing code.",
    ],
    tradeoffs: [
      {
        pro: "Handlers are focused — they don't know or care about side effects downstream.",
        con: 'Handler-dispatched events lack the compile-time traceability of aggregate-raised events. A developer must read the handler to know which events it emits.',
      },
      {
        pro: 'The interface swap path to a message broker is one line in the singleton — no domain changes required.',
        con: 'Still single-process dispatch. Multi-instance fan-out requires an external broker.',
      },
    ],
    codeBlocks: [
      {
        label:
          'IEventBus interface — defined in domain, no infrastructure dependency',
        code: `type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

interface IEventBus {
  register<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  dispatch(events: DomainEvent[]): Promise<void>;
}`,
      },
      {
        label: 'Aggregate-raised event — the aggregate owns the state change',
        code: `class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const user = new User(id, email, passwordHash);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.address));
    return user;
  }
}

// Handler — pull after persistence
await this.userRepository.save(user);
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);`,
      },
      {
        label: 'Handler-dispatched event — no aggregate owns the action',
        code: `// LoginUserHandler — login is a use-case fact, not a session lifecycle fact
const session = UserSession.create(sessionId, user.id, user.tier);
await this.sessionRepository.save(session);
await this.eventBus.dispatch([new UserLoggedInEvent(user.id.value)]);

// LogoutUserHandler — the aggregate is being revoked, not transitioned
await this.sessionRepository.revokeById(sessionId);
if (session) {
  await this.eventBus.dispatch([new UserLoggedOutEvent(session.userId.value)]);
}`,
      },
    ],
  },
  {
    slug: 'server-actions',
    title: 'Next.js server actions via next-safe-action',
    subtitle:
      'Composable middleware, schema validation, and a single catch boundary — powered by next-safe-action.',
    badge: 'Transport layer',
    context:
      'Server actions are the transport layer — the equivalent of controllers in an MVC stack. Without a shared factory, each action needs its own try/catch, its own session check, and its own response shape. Three actions in and the duplication is obvious. Ten actions in and the divergence is a bug waiting to happen.',
    decision:
      'All server actions are wired via `next-safe-action`. An `actionClient` is configured once with `handleServerError` as the single catch boundary. Each action chains `.use()` middleware for auth, rate limiting, and feature flags, then declares its input schema via `.inputSchema()`. Controllers return DTOs directly — actions do not call `getValueOrThrow()`. Server actions are POST-only; reads use server-side loaders.',
    rationale: [
      '`.use(withAuth)` resolves the session before the handler runs and injects it into `ctx`. A missing or invalid session rejects before the handler is ever called.',
      '`handleServerError` is the single catch boundary. It maps thrown errors via `toErrorResponse` and returns `{ code, message }` as `result.serverError` — no per-action error handling needed.',
      '`toErrorResponse` maps `DomainException`, Prisma errors, and unexpected errors to stable external codes. The client never sees stack traces or internal exception names.',
      'The `execute()` utility bridges next-safe-action results to TanStack Query — it checks `result.serverError` and throws `ActionError(code, message)`, which TanStack Query catches for retry and global error handling.',
    ],
    tradeoffs: [
      {
        pro: 'Middleware is composable — `.use(withAuth).use(withRateLimit)` reads like a pipeline and each concern is independently testable.',
        con: 'next-safe-action is a third-party dependency. A breaking change in its API affects every action simultaneously.',
      },
      {
        pro: 'Schema validation, session resolution, and error mapping are configured once on the `actionClient`, not per action.',
        con: 'Engineers unfamiliar with next-safe-action need to understand the `.use()` chaining and `handleServerError` flow before they can reason about any action.',
      },
    ],
    codeBlocks: [
      {
        label: 'Unprotected action — rate-limited with input schema',
        code: `'use server';

const loginAction = actionClient
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    return identityController.loginUser(
      parsedInput.email,
      parsedInput.password,
    );
  });`,
      },
      {
        label: 'Protected action — auth, feature flag, and input schema',
        code: `'use server';

const createBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsController.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );
  });`,
      },
      {
        label: 'actionClient setup with handleServerError + execute() bridge',
        code: `// actionClient — single catch boundary
const actionClient = createSafeActionClient({
  handleServerError: (err) => {
    logger.error(err);
    return toErrorResponse(err);
  },
});

// execute() — bridges next-safe-action to TanStack Query
const execute = async <T>(
  result: SafeActionResult<T>,
): Promise<T> => {
  if (result.serverError) {
    const { code, message } = result.serverError;
    throw new ActionError(code, message);
  }
  return result.data as T;
};`,
      },
    ],
  },
  {
    slug: 'fsd-frontend',
    title: 'Feature-Sliced Design (lite)',
    subtitle:
      'The layered model and one-way dependency rules from FSD — without the full specification overhead.',
    badge: 'Frontend architecture',
    context:
      'React projects commonly devolve into a `components/` folder that is half presentational primitives, half feature-specific logic, with hooks importing from components and components importing from hooks that import from other components. There is no rule governing what can import from what, so the answer becomes "anything from anywhere" and the coupling is invisible until it is painful.',
    decision:
      'Apply a lite variant of Feature-Sliced Design (https://feature-sliced.design/overview). The layer names, one-way dependency rule, and barrel index convention are taken directly from FSD. The full specification — formal slice/segment naming, strict public API enforcement — is not applied. Analogous to DDD-lite: the discipline is real, the ceremony is reduced.',
    rationale: [
      'The one-way rule is enforced by convention and code review — not a linter today, but the rules are explicit and documented. Adding eslint-plugin-boundaries is a one-sprint addition.',
      "Each layer has a barrel `index.ts`. Consumers import from the barrel, not from deep internal paths. This means a layer's internal structure can be refactored without touching import paths outside it.",
      'Feature modules own their complete slice — server actions, hooks, and UI. Adding a feature means adding a folder, not touching shared infrastructure.',
      'Primitive components (`_components/`) are stateless and have no feature dependencies. They can be extracted to a shared package with no refactoring.',
    ],
    tradeoffs: [
      {
        pro: 'Dependency direction is explicit and reviewable — a wrong import is visible in a PR.',
        con: 'Without a linter rule, the convention relies on discipline. `eslint-plugin-boundaries` should be added to enforce it automatically.',
      },
      {
        pro: 'Features are isolated — you can delete an entire feature folder without breaking others.',
        con: 'The "lite" label means not following the full FSD spec — engineers familiar with FSD may find the deviations inconsistent.',
      },
    ],
    codeBlocks: [
      {
        label: 'Layer structure and dependency direction',
        code: `src/app/
  _lib/          # base layer — shared utilities, factories, services
  _components/   # primitive, stateless UI — button, input, card
  _widgets/      # compositional blocks — header, footer, dashboard-header
  _providers/    # app-level context — theme, auth
  _features/     # domain feature modules
    auth/
      actions/   # server actions
      hooks/       # client hooks (useLoginForm, useRegisterForm)
      ui/        # feature-specific components (LoginForm, RegisterForm)

# Dependency rule: lower layers never import from higher ones
# _lib → _components → _widgets → _features → routes`,
      },
      {
        label: 'Feature module — complete slice in one folder',
        code: `_features/auth/
  actions/
    login.action.ts      # 'use server' — calls commandBus
    register.action.ts
    index.ts
  hooks/
    use-login-form.hook.ts    # TanStack Form + mutation
    use-register-form.hook.ts
    index.ts
  ui/
    login-form.tsx       # uses hooks, _components only
    register-form.tsx
    index.ts`,
      },
    ],
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    slug: 'jwt-auth',
    title: 'JWT authentication — stateless access, stateful refresh',
    subtitle:
      'Short-lived JWTs eliminate per-request database lookups. The gaps are deliberate scope decisions, not architectural oversights.',
    badge: 'Security',
    context:
      'The original session architecture used opaque tokens stored in the database. Every request — page load, mutation, middleware check — required a database round-trip to validate the session. For a server-rendered Next.js app where the proxy runs on every protected route, this meant a DB query before the page even started rendering. JWT authentication moves validation to a signature check with zero I/O.',
    decision:
      'Replace opaque session tokens with short-lived JWT access tokens (15 minutes). The JWT carries userId, email, and tier in the payload. The proxy validates the signature via jose — no database hit. Server actions validate the same way via withAuth middleware. The session table remains for refresh tokens, but the refresh flow is not yet implemented — token expiry redirects to login.',
    rationale: [
      'The proxy runs on every protected route. A database lookup per request adds latency before the page starts streaming. JWT signature verification is sub-millisecond with zero I/O.',
      'The JWT payload carries the minimum data needed for authorization decisions — userId for data scoping, tier for feature gating, email for display. No sensitive data, no permissions list, no role hierarchy.',
      'JwtService is a plain object implementing IJwtService — sign and verify. The proxy imports it directly from the file path to avoid pulling Prisma through the barrel. withAuth and loadSession use the same service through the infrastructure barrel.',
      'The session table stores refresh tokens (opaque session IDs). When the refresh flow is built, the client sends the refresh token to get a new JWT without re-authenticating. The session can be revoked in the database, killing the refresh path.',
    ],
    tradeoffs: [
      {
        pro: 'Zero database I/O for authentication on every request. Proxy, server actions, and server components all validate locally.',
        con: 'JWTs cannot be revoked mid-flight. A compromised token is valid until expiry (15 minutes). Instant revocation requires a Redis blacklist checked in the proxy.',
      },
      {
        pro: 'The payload is self-contained — no join, no lookup, no cache. The proxy decodes and has everything it needs.',
        con: "Payload data can go stale. If a user's tier changes, the JWT still carries the old tier until it expires and is re-signed.",
      },
      {
        pro: 'Short expiry (15 minutes) limits the window for stale data and compromised tokens.',
        con: 'Without a refresh flow, users re-authenticate every 15 minutes. Acceptable for a portfolio project, not for a production app with active sessions.',
      },
    ],
    codeBlocks: [
      {
        label: 'JwtService — sign and verify with jose',
        code: `const JwtService: IJwtService = {
  async sign(payload: JwtData): Promise<Result<string, DomainException>> {
    const token = await new SignJWT({
      email: payload.email,
      tier: payload.tier,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.userId)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(SECRET);

    return Result.ok(token);
  },

  async verify(token: string): Promise<Result<JwtData, DomainException>> {
    const { payload } = await jwtVerify(token, SECRET);
    return Result.ok({
      userId: payload.sub,
      email: payload.email,
      tier: payload.tier,
    });
  },
};`,
      },
      {
        label: 'Proxy — validates JWT on every protected route',
        code: `// src/proxy.ts — runs before every matched route
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const result = await JwtService.verify(token);

  if (result.isFailure) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/overview/:path*', '/transactions/:path*', '/budgets/:path*',
            '/accounts/:path*', '/settings/:path*'],
};`,
      },
      {
        label: 'Production hardening — documented upgrade path',
        code: `// Today: JWT expires → proxy redirects → user re-authenticates
// Gaps documented, not overlooked:
//
// 1. Refresh flow: store refresh token in second httpOnly cookie,
//    POST /api/auth/refresh validates session in DB, signs new JWT.
//    User stays logged in for session lifetime (7 days) without
//    re-entering credentials.
//
// 2. Instant revocation: Redis blacklist checked in proxy.
//    On password change or account compromise, add userId to Redis
//    with TTL matching JWT expiry. Proxy checks blacklist before
//    accepting the JWT signature.
//
// 3. Token rotation on sensitive actions: password change, tier
//    upgrade, email change — re-sign JWT with updated payload,
//    replace the cookie in the response.
//
// 4. Claims hardening: add iss (issuer) and aud (audience) to
//    prevent token reuse across services.`,
      },
    ],
  },
  {
    slug: 'observability',
    title: 'OpenTelemetry + Grafana Cloud — traces without vendor lock-in',
    subtitle:
      'Open standards for instrumentation. The backend is a config swap, not a rewrite.',
    badge: 'Infrastructure',
    context:
      'Handler failures were initially logged to console — invisible in production, impossible to query, no correlation to the request that triggered them. The application needed observability without coupling to a specific vendor. Sentry captures errors well but is proprietary. Datadog is full-stack but expensive. OpenTelemetry is the open standard — instrument once, export anywhere.',
    decision:
      'Instrument the command and query buses with OpenTelemetry spans. Each handler dispatch creates a child span within the active HTTP request trace. Handler failures enrich the active span with error attributes. Traces export to Grafana Cloud via the OTLP HTTP exporter. Sampling is environment-aware: 100% in development, configurable (default 10%) in production.',
    rationale: [
      'The IObservabilityService interface decouples the application from OpenTelemetry. The bus calls recordHandlerFailure() — it does not know about spans, exporters, or Grafana. Swapping the implementation is a one-file change.',
      'Bus-level spans fill the blind spot between the HTTP request span and the response. Without them, 300ms+ of handler execution is invisible in the trace timeline. With them, you see exactly which handler ran and how long it took.',
      'The OpenTelemetry SDK reads OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS from the environment. No Grafana-specific code in the application. Switching to Datadog, Honeycomb, or Jaeger is an env var change.',
      'Sampling prevents cost overrun in production. TraceIdRatioBasedSampler drops a configurable percentage of traces before export. Errors within sampled traces are always enriched — they are not silently dropped.',
    ],
    tradeoffs: [
      {
        pro: 'Open standard — no vendor lock-in. Same instrumentation works with Grafana, Datadog, Jaeger, Zipkin, or any OTLP-compatible backend.',
        con: 'Head-based sampling means some errors in unsampled traces are never exported. True "always capture errors" requires tail-based sampling via an OpenTelemetry Collector — added infrastructure.',
      },
      {
        pro: 'Bus-level spans give handler-granularity visibility. You see GetBudgetOverviewHandler took 45ms, not just "POST /budgets returned in 200ms."',
        con: 'Every handler dispatch creates a span. At high throughput this adds overhead — mitigated by sampling, but the instrumentation cost is nonzero.',
      },
      {
        pro: 'Grafana Cloud free tier provides 50GB traces — effectively unlimited for a portfolio project.',
        con: 'Production traffic at scale would exceed the free tier. The sampling rate (OTEL_SAMPLE_RATE env var) controls cost, but requires tuning per deployment.',
      },
    ],
    codeBlocks: [
      {
        label: 'instrumentation.ts — SDK init with environment-aware sampling',
        code: `export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const { ATTR_SERVICE_NAME } = await import('@opentelemetry/semantic-conventions');
    const { TraceIdRatioBasedSampler, AlwaysOnSampler } = await import('@opentelemetry/sdk-trace-node');

    const isProduction = process.env.NODE_ENV === 'production';
    const sampleRate = Number(process.env.OTEL_SAMPLE_RATE ?? (isProduction ? 0.1 : 1.0));

    const sampler = sampleRate >= 1.0
      ? new AlwaysOnSampler()
      : new TraceIdRatioBasedSampler(sampleRate);

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'ledger' }),
      traceExporter: new OTLPTraceExporter(),
      sampler,
    });

    sdk.start();
  }
}`,
      },
      {
        label: 'Bus dispatch — handler spans as children of the request trace',
        code: `// CommandBus.dispatch — same pattern in QueryBus
async dispatch<T extends AnyCommand>(command: T): Promise<T['_response']> {
  const key = command.constructor.name;
  const handler = this._handlers.get(key);

  return tracer.startActiveSpan(\`command.\${key}\`, async (span) => {
    try {
      const result = await handler.execute(command);
      span.end();
      return result;
    } catch (error) {
      this.observability.recordHandlerFailure(key, error);
      span.end();
      throw error;
    }
  });
}`,
      },
      {
        label: 'ObservabilityService — enriches the active span, no new span',
        code: `const ObservabilityService: IObservabilityService = {
  recordHandlerFailure(handlerName: string, error: unknown): void {
    const span = trace.getActiveSpan();
    if (!span) return;

    span.setAttribute('handler.name', handlerName);
    span.setAttribute('error.type', error instanceof Error ? error.constructor.name : 'UnknownError');
    span.setAttribute('error.message', error instanceof Error ? error.message : 'Unknown error');
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  },
};`,
      },
      {
        label: 'Scaling path — tail-based sampling via Collector',
        code: `// Today: head-based sampling (SDK decides before export)
// Limitation: unsampled requests lose their error traces
//
// Production upgrade: OpenTelemetry Collector with tail-based sampling
//
// App (SDK, sample 100%) → Collector → evaluates complete traces
//   → errors: always export to Grafana
//   → successes: export 10% to Grafana
//   → rest: drop
//
// App code unchanged. Collector is a deployment concern.
// OTEL_EXPORTER_OTLP_ENDPOINT points to Collector instead of Grafana.`,
      },
    ],
  },
];

const getDecision = (slug: string): ArchitectureDecision | undefined =>
  decisions.find((d) => d.slug === slug);

const getSlugs = (): string[] => decisions.map((d) => d.slug);

export {
  decisions,
  getDecision,
  getSlugs,
  type CodeBlock,
  type ArchitectureDecision,
};
