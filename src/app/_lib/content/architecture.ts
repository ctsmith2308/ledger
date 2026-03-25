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
    subtitle: 'Commands and queries are separate concerns. The bus makes dispatch type-safe without boilerplate.',
    badge: 'Application layer',
    context:
      'The original implementation wired handlers directly into an identity module object — `identityModule.loginUser.execute(dto)`. As the number of commands grew, two problems emerged: the module became a dependency magnet (every handler\'s dependencies had to be instantiated in one place), and call sites had to know which module owned which handler.',
    decision:
      'Introduce a CommandBus and QueryBus in the shared infrastructure layer. Each command lives in its own folder and self-registers against the bus on import. Dispatch is the only public API — callers don\'t need to know which handler runs.',
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
import { commandBus, prisma, InProcessEventBus } from '@/core/shared/infrastructure';
import { UserRepository, UserSessionRepository } from '../../../infrastructure/repository';
import { PasswordHasher, IdGenerator } from '../../../infrastructure/services';
import { LoginUserCommand } from './login-user.command';
import { LoginUserHandler } from './login-user.handler';

commandBus.register(
  LoginUserCommand,
  new LoginUserHandler(
    new UserRepository(prisma),
    new UserSessionRepository(prisma),
    new InProcessEventBus(),
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
    subtitle: 'Service boundaries drawn too early are a bet on requirements you don\'t have yet.',
    badge: 'System design',
    context:
      'Microservices are a default architectural choice in many senior engineering conversations. The assumption is that distributed systems are the "correct" answer for serious applications. But microservices introduce real costs — network overhead, distributed tracing, deployment complexity, and eventual consistency — that are only justified when the domain boundaries are well understood and the team is large enough to own separate services.',
    decision:
      'Build a modular monolith. Domain boundaries are enforced at the module level with explicit dependency wiring and no cross-module imports. Each module owns its domain, application, and infrastructure layers. The event bus handles cross-module communication without tight coupling. Splitting into services later is a deployment decision, not an architectural rewrite.',
    rationale: [
      'Domain boundaries are hard to get right on the first pass. A modular monolith lets you refine them cheaply — a microservice boundary is expensive to move once it\'s a network contract.',
      'The IEventBus interface means cross-module communication is already decoupled. Swapping InProcessEventBus for a durable queue (SQS, RabbitMQ) is an infrastructure change with no domain impact.',
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
        pro: 'The event bus interface already models the cross-module communication pattern that a message broker would use.',
        con: 'In-process events are not durable. A crash before dispatch loses events. Acceptable now; not acceptable at scale.',
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

// Today: in-process
const _eventBus = new InProcessEventBus();

// Tomorrow: swap one line, zero domain changes
const _eventBus = new SqsEventBus(sqsClient, queueUrl);`,
      },
    ],
  },
  {
    slug: 'domain-driven-design',
    title: 'Domain-Driven Design',
    subtitle: 'A finance domain has real invariants worth modelling explicitly. A todo app wouldn\'t justify this.',
    badge: 'Domain layer',
    context:
      'DDD is overused as a buzzword and underused as an actual discipline. The choice to apply it here isn\'t fashion — it\'s that a personal finance domain genuinely has invariants that need enforcement. An email address isn\'t just a string. A password has strength requirements. A user aggregate has registration lifecycle rules. These rules belong in the domain, not scattered across handlers and validators.',
    decision:
      'Apply DDD-lite: aggregates, value objects, domain events, and repository interfaces in the domain layer. No IoC container, no decorators. Dependencies are wired explicitly. The domain knows nothing about Next.js, Prisma, or HTTP — only about business rules.',
    rationale: [
      'Value objects validate invariants at construction time. `Email.create("not-an-email")` returns `Result.fail(new InvalidEmailException())` — invalid state can never be represented.',
      'The `Result<T, E>` type makes failure explicit at every boundary. No exceptions bubble silently through the call stack; every failure path is a typed value.',
      'Repository interfaces are defined in the domain layer and implemented in infrastructure. The domain can be tested without a database — pass a mock that implements `IUserRepository`.',
      'Domain events (`UserRegistered`, `UserLoggedIn`) capture what happened in business terms. They\'re pulled from the aggregate after persistence and dispatched via the event bus — decoupling side effects from the core operation.',
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
        label: 'Domain events on the aggregate',
        code: `class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const user = new User(id, email, passwordHash);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));
    return user;
  }
}

// In the handler — after save, pull and dispatch
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);`,
      },
      {
        label: 'Repository interface in domain, implementation in infrastructure',
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
    subtitle: 'Domain events decouple what happened from what happens next. The interface hides the delivery mechanism.',
    badge: 'Infrastructure',
    context:
      'After a user registers, a welcome email should eventually be sent. After login, an audit log entry should be written. These are side effects — they should not be the core operation\'s responsibility. Putting them directly in the handler couples unrelated concerns and makes the handler harder to test.',
    decision:
      'Domain events are raised on aggregates, pulled after persistence, and dispatched via an `IEventBus` interface. Today the implementation is in-process (`InProcessEventBus`). The interface is defined in the domain layer — swapping the implementation requires no domain changes.',
    rationale: [
      'The aggregate raises events (`user.addDomainEvent(new UserRegisteredEvent(...))`), not the handler. The aggregate describes what happened in business terms; the handler decides when to dispatch.',
      'Events are pulled after the aggregate is persisted, not before. This avoids dispatching events for operations that fail to save.',
      'The `IEventBus` interface in the domain layer means the domain has zero knowledge of how events are delivered. In tests, pass a mock or no-op implementation.',
      'Handler registration (`eventBus.register(IdentityEvents.USER_REGISTERED, sendWelcomeEmail)`) is additive — new side effects don\'t touch existing code.',
    ],
    tradeoffs: [
      {
        pro: 'Handlers are focused — they don\'t know or care about side effects downstream.',
        con: 'In-process delivery is not durable. If the process crashes after save but before dispatch, events are lost. Acceptable for audit logs; not for financial operations.',
      },
      {
        pro: 'The interface swap path to a durable queue is one line per wiring file — no domain changes required.',
        con: 'No retry, no dead-letter queue, no at-least-once delivery guarantee without swapping the implementation.',
      },
    ],
    codeBlocks: [
      {
        label: 'IEventBus interface — defined in domain, no infrastructure dependency',
        code: `type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

interface IEventBus {
  register<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  dispatch(events: DomainEvent[]): Promise<void>;
}`,
      },
      {
        label: 'InProcessEventBus — handlers run in-process via Promise.all',
        code: `class InProcessEventBus implements IEventBus {
  private readonly _handlers = new Map<string, EventHandler[]>();

  register<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const existing = this._handlers.get(eventType) ?? [];
    this._handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this._handlers.get(event.eventType) ?? [];
      await Promise.all(handlers.map((h) => h(event)));
    }
  }
}`,
      },
      {
        label: 'Swap path — replace InProcessEventBus with a durable queue',
        code: `// commands/login-user/index.ts — one line change per wiring file, zero domain impact
// Before
new LoginUserHandler(new UserRepository(prisma), new InProcessEventBus(), ...)

// After
new LoginUserHandler(new UserRepository(prisma), new SqsEventBus(sqsClient, QUEUE_URL), ...)`,
      },
    ],
  },
  {
    slug: 'server-actions',
    title: 'Next.js server actions via createAction',
    subtitle: 'One factory, one catch boundary, one consistent response shape across every action.',
    badge: 'Transport layer',
    context:
      'Server actions are the transport layer — the equivalent of controllers in an MVC stack. Without a shared factory, each action needs its own try/catch, its own session check, and its own response shape. Three actions in and the duplication is obvious. Ten actions in and the divergence is a bug waiting to happen.',
    decision:
      'All server actions are created via a `createAction` higher-order factory. It handles session resolution for protected actions, wraps the handler in a single catch boundary, and normalises all outcomes — success, domain failure, validation error, and unexpected crash — into one `ActionResult<T>` shape.',
    rationale: [
      '`protected: true` resolves the session before the handler runs and injects `AuthUser`. A missing or invalid session throws before the handler is ever called.',
      '`getValueOrThrow()` is the unwrapping convention throughout. Domain failures surface as thrown `DomainException` instances and land in the factory\'s catch block — no per-action error handling needed.',
      '`toErrorResponse` maps `DomainException`, Prisma errors, and unexpected errors to stable external codes. The client never sees stack traces or internal exception names.',
      'The discriminated union config type (`protected: true` vs `protected: false`) means TypeScript narrows the handler signature — a protected handler receives `(session, input)`, an unprotected handler receives `(input)` only.',
    ],
    tradeoffs: [
      {
        pro: 'Every action has the same shape — consistent, predictable, and easy to handle on the client.',
        con: 'The factory is a shared abstraction. A bug in it affects every action simultaneously.',
      },
      {
        pro: 'Schema validation, session resolution, and error mapping are tested once in the factory, not per action.',
        con: 'Engineers unfamiliar with the HOF pattern need to understand createAction before they can reason about any action\'s behaviour.',
      },
    ],
    codeBlocks: [
      {
        label: 'Unprotected action — validation is the handler\'s responsibility',
        code: `const loginAction = createAction({
  handler: async (input: unknown) => {
    const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();

    const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
    const { jwt } = result.getValueOrThrow();

    SessionService.set(jwt);
  },
});`,
      },
      {
        label: 'Protected action — session resolved and injected before handler runs',
        code: `const getProfileAction = createAction({
  protected: true,
  handler: async (session: AuthUser, input: unknown) => {
    const result = await queryBus.dispatch(new GetUserProfileQuery(session.id));
    return result.getValueOrThrow();
  },
});`,
      },
      {
        label: 'createAction — the full catch boundary',
        code: `const createAction = <TInput, TOutput>(
  config: ProtectedConfig<TInput, TOutput> | UnprotectedConfig<TInput, TOutput>,
) => {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      if (config.protected) {
        const session = await SessionService.get();
        const sessionResult = session.getValueOrThrow();
        const data = await config.handler(sessionResult, input);
        return { success: true, data };
      }
      const data = await config.handler(input);
      return { success: true, data };
    } catch (err: unknown) {
      logger.error(err);
      const { code, message } = toErrorResponse(err);
      return { success: false, code, message };
    }
  };
};`,
      },
    ],
  },
  {
    slug: 'fsd-frontend',
    title: 'Feature-Sliced Design (lite)',
    subtitle: 'The layered model and one-way dependency rules from FSD — without the full specification overhead.',
    badge: 'Frontend architecture',
    context:
      'React projects commonly devolve into a `components/` folder that is half presentational primitives, half feature-specific logic, with hooks importing from components and components importing from hooks that import from other components. There is no rule governing what can import from what, so the answer becomes "anything from anywhere" and the coupling is invisible until it is painful.',
    decision:
      'Apply a lite variant of Feature-Sliced Design (https://feature-sliced.design/overview). The layer names, one-way dependency rule, and barrel index convention are taken directly from FSD. The full specification — formal slice/segment naming, strict public API enforcement — is not applied. Analogous to DDD-lite: the discipline is real, the ceremony is reduced.',
    rationale: [
      'The one-way rule is enforced by convention and code review — not a linter today, but the rules are explicit and documented. Adding eslint-plugin-boundaries is a one-sprint addition.',
      'Each layer has a barrel `index.ts`. Consumers import from the barrel, not from deep internal paths. This means a layer\'s internal structure can be refactored without touching import paths outside it.',
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
];

const getDecision = (slug: string): ArchitectureDecision | undefined =>
  decisions.find((d) => d.slug === slug);

const getSlugs = (): string[] => decisions.map((d) => d.slug);

export { decisions, getDecision, getSlugs, type CodeBlock, type ArchitectureDecision };
