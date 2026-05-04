# Architecture

This document is the authoritative record of architectural decisions, experiments, and the reasoning behind each pivot. It exists to answer the "why" questions: not just what the current architecture is, but what was tried before it and why it was abandoned.

---

## Table of Contents

1. [The Core Principle](#1-the-core-principle)
2. [Evolutionary History](#2-evolutionary-history)
   - [Phase 1 — NestJS + Fastify + Nuxt monorepo](#phase-1--nestjs--fastify--nuxt-monorepo)
   - [Phase 2 — Collapse to Next.js](#phase-2--collapse-to-nextjs)
   - [Phase 3 — tRPC bridge](#phase-3--trpc-bridge)
   - [Phase 4 — Server actions only](#phase-4--server-actions-only)
   - [Phase 5 — Command Bus / Query Bus](#phase-5--command-bus--query-bus)
3. [Current Architecture](#3-current-architecture)
4. [Domain Layer](#4-domain-layer)
5. [Application Layer](#5-application-layer)
6. [Infrastructure Layer](#6-infrastructure-layer)
7. [Transport Layer](#7-transport-layer)
8. [Frontend — Feature-Sliced Design](#8-frontend--feature-sliced-design)
9. [Validation Strategy](#9-validation-strategy)
10. [Security Considerations](#10-security-considerations)
11. [Concepts & Further Reading](#11-concepts--further-reading)

---

## 1. The Core Principle

The domain knows nothing about Next.js, Prisma, tRPC, or HTTP. It only knows about business rules.

Every architectural decision in this project flows from that constraint. The transport layer calls domain handlers. Domain handlers return results. The transport layer maps those results to responses. Swapping any layer outside `src/core/` leaves the domain untouched. This was proven when the project migrated from NestJS to Next.js, then added and removed tRPC, without touching a single file in `src/core/modules/`.

---

## 2. Evolutionary History

### Phase 1 — NestJS + Fastify + Nuxt monorepo

**Commits:** `660b3e0` through `9c11054`
**Duration:** ~1 week

The initial architecture was a three-service monorepo:

```
apps/
  ledger-api-core/      # NestJS. Domain logic, CQRS, Prisma.
  ledger-api-gateway/   # Fastify. Auth middleware, routing, proxying.
  ledger-frontend/      # Nuxt 3. Vue frontend.
docker-compose.yml      # wired all three together
```

**What was built:**

`ledger-api-core` was a full NestJS application with genuine DDD structure: aggregates, value objects, repository interfaces, domain events. The architecture was sound. The framework wiring was the problem.

`ledger-api-gateway` was a Fastify server with:
- Auth middleware stub (`middleware/auth.middleware.ts`).
- Route groups for app health, intelligence, and webhooks.
- Intended to proxy to `ledger-api-core` and eventually other backend services.

`ledger-frontend` was a Nuxt 3 application with a Vue frontend.

**The NestJS boilerplate in practice:**

NestJS `CqrsModule` requires decorating every handler with `@CommandHandler` or `@QueryHandler`, registering it in the module's `providers` array, and using custom IoC tokens with `@Inject()` for interface-typed dependencies. Here's what the actual wiring looked like:

```ts
// identity.module.ts, providers array required for every handler and service
@Module({
  imports: [CqrsModule],
  controllers: [IdentityController],
  providers: [
    ...IdentityApplicationProviders,    // [RegisterUserHandler]
    ...IdentityInfrastructureProviders, // token/useClass mappings
  ],
})
class IdentityModule {}
```

```ts
// identity.providers.ts, explicit token-to-class mappings for every interface
const IdentityInfrastructureProviders: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserRepository },
  { provide: ID_GENERATOR,    useClass: UuIdV4IdGenerator },
  { provide: PASSWORD_HASHER, useClass: ArgonPasswordHasher },
];
```

```ts
// register-user.handler.ts. @CommandHandler ties handler to NestJS CqrsModule;
// @Inject() resolves interface dependencies via IoC token strings
@CommandHandler(RegisterUserCommand)
class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(ID_GENERATOR)    private readonly idGenerator: IIdGenerator,
    private readonly eventBus: EventBus, // NestJS EventBus, not IEventBus
  ) {}

  async execute(command: RegisterUserCommand) { ... }
}
```

Every new handler required: a `@CommandHandler` decorator, a `providers` array entry in the module, and a token constant (`USER_REPOSITORY`, `PASSWORD_HASHER`, etc.) for each injected interface. This is not unique to this project. It's the prescribed NestJS pattern. It works at scale with a large team. For a single developer, it was ceremony that obscured rather than clarified.

**Why it was abandoned:**

- **IoC token boilerplate**: Every interface dependency requires a string/symbol token (`USER_REPOSITORY`), a corresponding `{ provide: TOKEN, useClass: Impl }` provider entry, and an `@Inject(TOKEN)` decorator on the constructor parameter. The overhead compounds with each new handler.
- **Implicit dependency graph**: A missing provider entry throws at runtime: `Nest can't resolve dependencies of X`. TypeScript cannot catch this at compile time because the IoC container resolves tokens at startup, not at type-check time.
- **`@CommandHandler` decorator lock-in**: `@CommandHandler(RegisterUserCommand)` and `implements ICommandHandler` are NestJS primitives. The handler cannot be instantiated or tested without bootstrapping the NestJS IoC container, or at minimum mocking it.
- **NestJS `EventBus` vs `IEventBus`**: The event bus was injected as NestJS's own `EventBus` type, not the domain interface. This meant the handler had a direct NestJS dependency at the application layer, which should be framework-agnostic.
- **Three-service overhead**: Running a Fastify gateway in front of a NestJS service for a single-developer portfolio project is operational ceremony with no current benefit. The gateway pattern is correct at scale; it is premature here.

The domain core (`src/core/`), meaning value objects, aggregates, and handlers, survived this phase intact and transferred directly to the Next.js monolith. The NestJS-specific wiring was the only casualty.

**What was kept:**

Everything in `src/core/`. The DDD structure, `Result<T, E>` type, value objects, repository interfaces, and the handler concept (`execute(command)`) were designed framework-agnostic from the start. They moved without modification. `@CommandHandler` became `commandBus.register()`, and `@Inject(USER_REPOSITORY)` became a constructor parameter. The domain logic was identical.

---

### Phase 2 — Collapse to Next.js

**Commit:** `d319766`

The three-service monorepo was collapsed into a single Next.js application. The Fastify gateway and NestJS service were removed. Prisma was wired directly.

**What this introduced:**

The first version of what became `createAction`, a set of middleware-style utilities:

```ts
// Early middleware approach, composed manually per action
withAuth(withLogger(withValidation(registerUserSchema)(handler)));
```

This was functional but verbose. Each action required explicit composition of middleware in the right order, and there was no consistent response shape guarantee. It evolved into the `createAction` HOF in the next phase.

**Dependency wiring** moved from NestJS IoC to explicit manual wiring:

```ts
// identity.module.ts. Explicit, visible, compile-time safe.
const repo = new UserRepository(prisma);
const identityModule = {
  registerUser: new RegisterUserHandler(repo, PasswordHasher, IdGenerator),
  loginUser: new LoginUserHandler(repo, PasswordHasher, JwtService),
};
```

No runtime surprises. If a dependency is missing, TypeScript catches it at compile time. The full graph is always visible.

---

### Phase 3 — tRPC bridge

**Commits:** `97fd629`, `e1dbf41`

tRPC was added as the API layer, with a Next.js route handler at `src/app/api/trpc/[procedure]/route.ts` bridging tRPC to the domain handlers.

**The portability argument for tRPC:**

| Concern | tRPC | Server Actions |
|---|---|---|
| API layer | tRPC, adapter swap to port | Next.js only |
| Auth | httpOnly cookie via tRPC context | Next.js session/cookie handling |
| Server state | TanStack Query, React/Vue/Svelte adapters | `use()`, `useFormState()`, React only |
| Type safety | End-to-end via tRPC, no codegen | Server action return types only |
| Middleware | Once in `procedure.ts`, applied everywhere | Per-action wrapper (HOF) |
| Bundle | tRPC client + TanStack Query | Zero additional client bundle |

The portability argument was genuine. Swapping Next.js for SvelteKit would mean:
- Replace `@tanstack/react-query` with the Vue/Svelte adapter.
- Replace the Next.js route handler with the target framework's equivalent.
- `src/core/` and the tRPC procedures stay untouched.

**Why it was abandoned:**

The portability argument is compelling when framework portability is a real requirement. It is not for this project. The decisive factors:

1. **No migration on the roadmap.** Carrying tRPC's mental model, the adapter wiring, and TanStack Query setup for a benefit that would never be realised was ceremony without payoff.
2. **Server actions already provide the core benefit.** The main value of tRPC's `procedure.ts` middleware chain (a shared auth check and a consistent response shape) was achievable with a simpler HOF pattern (`createAction`).
3. **Bundle cost.** Server actions add zero client bundle overhead. tRPC requires the tRPC client and TanStack Query on the client.

The `createAction` HOF that replaced it replicates the only tRPC features this project actually used. See [Phase 4](#phase-4--server-actions-only) and [Transport Layer](#7-transport-layer).

---

### Phase 4 — Server actions only

**Commit:** `4278357`

tRPC was removed. All server actions were created via `createAction`. The `withAuth`/`withLogger`/`withValidation` middleware composition from Phase 2 was consolidated into a single HOF with a discriminated union config type.

**What `createAction` recovered from tRPC:**

| tRPC feature | createAction equivalent |
|---|---|
| `protectedProcedure` middleware | `protected: true` config, session resolved before handler |
| Consistent response shape | `_toSuccess` / `_toFailure` mappers, always `ActionResult<T>` |
| Single catch boundary | Single `try/catch` in the factory, handles domain, Zod, and unexpected errors |
| Type-safe return | Server action return types inferred by TypeScript |

**What was genuinely lost:**

Framework portability. The action layer is now coupled to Next.js. The domain (`src/core/`) remains portable, with zero Next.js dependencies. But the transport layer would need to be rewritten, not re-adapted, for a framework migration. Acceptable for a portfolio project. Not acceptable for a product with an uncertain frontend future.

---

### Phase 5 — Command Bus / Query Bus

**Commit:** `54810fd`

The `identityModule` object that previously wired handlers directly was replaced with a `CommandBus` and `QueryBus`. Each command lives in its own folder and registers against the bus at module init time.

**What this solved:**

The identity module was becoming a dependency wiring file. Every new handler required instantiating its dependencies and adding an entry to the module object. Call sites had to know which module owned which handler. As command count grows, both problems compound.

**The phantom type approach:**

```ts
abstract class Command<TResponse = unknown> {
  declare readonly _response: TResponse; // compile-time only, zero runtime cost
}
```

`dispatch()` return types are inferred without an explicit generic at the call site:

```ts
// Return type is LoginUserResponse. TypeScript infers it from the phantom field.
const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
```

See [Application Layer, Command Bus](#command-bus--query-bus) for the full implementation.

---

## 3. Current Architecture

```
src/
  proxy.ts                          # Next.js middleware. JWT validation, route protection.

  core/                             # framework-agnostic domain and application logic
    modules/
      identity/                     # identity bounded context
        domain/                     # pure business rules, no infrastructure dependencies
          aggregates/               # User, UserProfile, UserSession
          events/                   # UserRegisteredEvent, LoginFailedEvent, MfaEnabledEvent, ...
          repositories/             # IUserRepository, IUserProfileRepository, IUserSessionRepository
          services/                 # IPasswordHasher, ITotpService, IIdGenerator
          value-objects/            # Email, Password, UserId, FirstName, LastName, UserTier, ...
        application/                # commands, queries, handlers
          commands/
            login-user/             # command + handler
            register-user/
            logout-user/
            delete-account/
            update-user-profile/
            setup-mfa/
            verify-mfa-setup/
            verify-mfa-login/
            disable-mfa/
            cleanup-expired-trials/
          queries/
            get-user-profile/
            get-user-account/
        infrastructure/             # Prisma repositories, password hasher, id generator, TOTP service
          repositories/             # .impl.ts suffix. UserRepository, UserProfileRepository, UserSessionRepository.
          mappers/                  # Prisma-to-domain mappers (user, profile, session)
          services/                 # PasswordHasher, IdGenerator, TotpService
        api/                        # composition root + public API
          identity.service.ts       # IdentityService. Dispatches via bus, maps results to DTOs, signs JWTs.
          identity.dto.ts           # response DTOs
          mappers/                  # domain-to-DTO mappers (UserMapper, UserProfileMapper, etc.)
          index.ts                  # IdentityModule.init(). Wires repos, registers handlers, returns service.
      banking/                      # Plaid integration bounded context
        domain/
        application/
        infrastructure/
        api/                        # BankingService, BankingModule.init()
      budgets/                      # budget management bounded context
        domain/
        application/
        infrastructure/
        api/                        # BudgetsService, BudgetsModule.init()
      transactions/                 # transaction sync and analytics bounded context
        domain/
        application/
        infrastructure/
        api/                        # TransactionsService, TransactionsModule.init()
    shared/
      domain/                       # shared domain primitives
        constants/                  # FEATURE_KEYS, USER_TIERS, JWT_TYPE, ERROR_CODES, TRANSACTION_CATEGORIES
        exceptions/                 # typed domain exceptions
        repositories/               # IFeatureFlagRepository
        services/                   # IJwtService, IIdGenerator, IFeatureFlagCache, IObservabilityService
        aggregate-root.ts
        bus/                        # Command<T> and Query<T> base classes
        domain-event.ts
        handler.ts                  # IHandler<TRequest, TResponse>
        result.ts                   # Result<T, E>
        value-object.ts
      infrastructure/               # shared infrastructure implementations
        bus/                        # CommandBus, QueryBus, EventBus, InProcessEventBus singletons
        cache/                      # UpstashFeatureFlagCache (Upstash Redis)
        persistence/                # Prisma singleton, PrismaService
        repositories/               # FeatureFlagRepository (Prisma)
        services/                   # JwtService, IdGenerator, ObservabilityService (OpenTelemetry)
        utils/                      # logger, toErrorResponse

  app/                              # Next.js app. Transport and UI layer.
    _shared/                        # shared utilities, libraries, content
      lib/
        next-safe-action/           # actionClient, handleActionResponse, ActionError
          middleware/               # withAuth, withFeatureFlag, withRateLimit
        session/                    # setCookie, deleteCookie, loadSession (React.cache)
        query/                      # getQueryClient, queryKeys, queryDefaults
        rate-limit/                 # rate limit service
        tailwind/                   # cn (tailwind merge)
      content/                      # portfolio copy. Architecture decisions, case studies.
      routes/                       # route constants
    _components/                    # primitive, stateless UI. Button, input, card.
    _widgets/                       # compositional blocks that assemble features into page sections.
    _providers/                     # app-level context. Theme, query.
    _entities/                      # data access layer. Server actions, action schemas, entity hooks.
      identity/
        actions/                    # login, register, logout, delete, mfa actions
        hooks/                      # useSession, useFeatureFlags
        schema/                     # Zod schemas for action inputs
      banking/
        actions/                    # createLinkToken, exchangePublicToken
        schema/
      budgets/
        actions/                    # createBudget, updateBudget, deleteBudget
        hooks/                      # useBudgetOverview
        schema/
      transactions/
        actions/                    # syncTransactions
        schema/
    _features/                      # domain feature modules. Hooks, UI, feature-specific schemas.
      auth/
        hooks/                      # useLoginForm, useRegisterForm, useLogout, useMfaVerifyForm
        ui/                         # LoginForm, RegisterForm, LogoutButton, MfaVerifyForm
      budgets/
        hooks/                      # useCreateBudgetForm, useUpdateBudget, useDeleteBudget
        schema/                     # form-level schemas
        ui/                         # BudgetList, CreateBudgetForm
      plaid/
        hooks/                      # usePlaidLinkFlow
        ui/                         # ConnectAccountCard
      accounts/
        ui/                         # AccountGroupList, AccountTotalsTable
      transactions/
        ui/                         # TransactionList, SpendingDoughnut
      user-account/
        hooks/                      # useConfigureMfa, useDeleteAccount, useUpdateProfileForm
        ui/                         # MfaSettingsCard, DeleteAccountCard, UpdateProfileForm
      theme/
        ui/                         # ThemeToggle
    (auth)/                         # auth route group. Centered layout.
    (dashboard)/                    # dashboard route group. Header layout.
    (public)/                       # public route group
```

---

## 4. Domain Layer

### Value Objects

Value objects validate invariants at construction time via a `Result`-returning static factory. Invalid state is unrepresentable. A handler that receives an `Email` instance has a guarantee it is valid.

```ts
class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Result<Email, InvalidEmailException> {
    const trimmed = (email ?? '').trim();

    if (!Email.isValid(trimmed)) {
      return Result.fail(new InvalidEmailException());
    }

    return Result.ok(new Email({ value: trimmed.toLowerCase() }));
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

Validation logic is encapsulated in a private static method so invariant rules are named, isolated, and directly testable without constructing the value object.

### Aggregates

Aggregates are the consistency boundary. They raise domain events, enforce invariants, and are persisted as a unit.

```ts
class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const tier = UserTier.from(USER_TIERS.TRIAL);
    const user = new User(id, email, passwordHash, tier);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));
    return user;
  }

  loggedIn(): void {
    this.addDomainEvent(new UserLoggedInEvent(this._id.value));
  }

  confirmMfa(): void {
    if (!this._mfaSecret) return;
    this._mfaEnabled = true;
    this.addDomainEvent(new MfaEnabledEvent(this._id.value));
  }

  disableMfa(): void {
    if (!this._mfaEnabled) return;
    this._mfaEnabled = false;
    this._mfaSecret = undefined;
    this.addDomainEvent(new MfaDisabledEvent(this._id.value));
  }
}
```

### Domain Events

Events follow two ownership patterns depending on whether the event describes the aggregate's own state change or a use-case-level fact.

**Aggregate-raised events.** The event describes what the aggregate did. The aggregate calls `addDomainEvent()` inside its mutation method. The handler pulls events after persistence and dispatches them.

```ts
// Aggregate owns the event
class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const tier = UserTier.from(USER_TIERS.TRIAL);
    const user = new User(id, email, passwordHash, tier);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.value));
    return user;
  }
}

// Handler. Pull after persistence.
await this.userRepository.save(user);
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);
```

**Handler-dispatched events.** The event describes what the use case accomplished. No single aggregate owns the action (no aggregate exists, the aggregate is being destroyed, or the event is a use-case coordination fact). The handler dispatches directly via `eventBus.dispatch()`.

```ts
// No aggregate to raise the event. Handler dispatches directly.
await this.sessionRepository.revokeById(sessionId);

if (session) {
  await this.eventBus.dispatch([
    new UserLoggedOutEvent(session.userId.value),
  ]);
}
```

Both paths flow through the same `EventBus` and land in the `domain_events` table. Pulling after save prevents dispatching events for operations that fail to persist.

| Event | Owner | Pattern |
|---|---|---|
| `UserRegisteredEvent` | `User.register()` | Aggregate-raised |
| `UserLoggedInEvent` | `User.loggedIn()` | Aggregate-raised |
| `UserProfileUpdatedEvent` | `UserProfile.updateName()` / `UserProfile.save()` | Aggregate-raised |
| `MfaEnabledEvent` | `User.confirmMfa()` | Aggregate-raised |
| `MfaDisabledEvent` | `User.disableMfa()` | Aggregate-raised |
| `BankAccountLinkedEvent` | `PlaidItem.create()` | Aggregate-raised |
| `BudgetCreatedEvent` | `Budget.create()` | Aggregate-raised |
| `TransactionCreatedEvent` | `Transaction.create()` | Aggregate-raised |
| `LoginFailedEvent` | `LoginUserHandler` | Handler-dispatched |
| `UserLoggedOutEvent` | `LogoutUserHandler` | Handler-dispatched |
| `AccountDeletedEvent` | `DeleteAccountHandler` | Handler-dispatched |
| `BankAccountUnlinkedEvent` | `UnlinkBankHandler` | Handler-dispatched |
| `BudgetExceededEvent` | `recordSpend` event handler | Handler-dispatched |
| `BudgetThresholdReachedEvent` | `recordSpend` event handler | Handler-dispatched |
| `SyncMismatchEvent` | `SyncTransactionsHandler` | Handler-dispatched |

**Why not full event sourcing:** The system persists events durably for audit, cross-module communication, and failure replay, but aggregates are reconstituted from database snapshots via `reconstitute()`, not from event replay. Full event sourcing would require every event to flow through an aggregate, aggregate reconstitution from event streams, and a message broker for reliable delivery and projection rebuilds. The infrastructure cost is not justified at the current scale. The `IEventBus` interface preserves the upgrade path.

### Result Type

All domain operations return `Result<T, E>` and never throw directly. Unwrapping uses `getValueOrThrow()` on its own line:

```ts
// Correct. Stack trace points to the exact line.
const result = await identityService.loginUser(dto.email, dto.password);
const { accessToken } = result;

// Wrong. Hard to trace in stack.
const { accessToken } = (await identityService.loginUser(dto.email, dto.password));
```

### Repository Interfaces

Repository interfaces are defined in the domain layer with no Prisma imports and no infrastructure dependencies. See [`IUserRepository`](https://github.com/ctsmith2308/ledger/blob/master/src/core/modules/identity/domain/repositories/user.repository.ts) for an example.

Implementations live in `infrastructure/repositories/` with an `.impl.ts` suffix (e.g., `user.repository.impl.ts`). Infrastructure mappers that convert between Prisma rows and domain aggregates live in `infrastructure/mappers/`. The domain can be unit tested with a mock `IUserRepository`, no database required.

### Domain Constants

Shared domain constants live in `core/shared/domain/constants/`:

| Constant | Purpose |
|---|---|
| `FEATURE_KEYS` | Feature flag identifiers (`BUDGET_WRITE`, `PLAID_CONNECT`, `ACCOUNT_WRITE`, `MFA`) |
| `USER_TIERS` | User tier values (`DEMO`, `TRIAL`, `FULL`) |
| `JWT_TYPE` | JWT purpose discriminator (`ACCESS`, `MFA_CHALLENGE`) |
| `ERROR_CODES` | Stable error codes for external responses (`UNAUTHORIZED`, `VALIDATION_ERROR`, `FEATURE_DISABLED`, ...) |
| `TRANSACTION_CATEGORIES` | Transaction category constants |

These are imported by both domain and infrastructure layers. They contain no logic, only typed constant objects.

---

## 5. Application Layer

### CQRS

Commands mutate state and return `Result`. Queries return data and do not mutate state. Handlers implement `IHandler<TRequest, TResponse>`:

```ts
interface IHandler<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}
```

No decorators, no IoC tokens. Just a typed contract that enforces the `execute` signature consistently.

### Command Bus / Query Bus

Commands are classes extending `Command<TResponse>`. The phantom `_response` field drives TypeScript's return type inference at dispatch:

```ts
abstract class Command<TResponse = unknown> {
  declare readonly _response: TResponse;
}

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(readonly email: string, readonly password: string) {
    super();
  }
}
```

`CommandBus.register` uses `{ type: string; prototype: T }` as the class token type. This avoids `Function` and `any` while letting TypeScript infer `T` from the class prototype:

```ts
register<T extends AnyCommand>(
  CommandClass: { type: string; prototype: T },
  handler: IHandler<T, T['_response']>,
): void {
  this._handlers.set(CommandClass.type, handler as IHandler<AnyCommand, unknown>);
}
```

### Composition Root — `api/index.ts`

Each module's composition root is `api/index.ts`. It instantiates repositories and services, registers all handlers on the buses, and exports the module's service instance. There is no self-registration pattern and no side-effect imports. Wiring is explicit and visible in one place:

```ts
// identity/api/index.ts
class IdentityModule {
  private constructor() {}

  static init(): IdentityService {
    const repos = {
      userRepository: new UserRepository(prisma),
      userSessionRepository: new UserSessionRepository(prisma),
      userProfileRepository: new UserProfileRepository(prisma),
    };

    const services = {
      passwordHasher: PasswordHasher,
      idGenerator: IdGenerator,
      eventBus,
    };

    commandBus.register(
      RegisterUserCommand,
      new RegisterUserHandler(
        repos.userRepository,
        repos.userProfileRepository,
        services.eventBus,
        services.passwordHasher,
        services.idGenerator,
      ),
    );

    commandBus.register(
      LoginUserCommand,
      new LoginUserHandler(
        repos.userRepository,
        services.eventBus,
        services.passwordHasher,
      ),
    );

    // ... remaining handler registrations ...

    return new IdentityService(commandBus, queryBus, JwtService);
  }
}

const identityService = IdentityModule.init();
export { identityService, type IdentityService };
```

The module's `index.ts` re-exports from `api/`:

```ts
// identity/index.ts
export { identityService } from './api';
export * from './api/identity.dto';
```

### Service Layer — `api/identity.service.ts`

The service is the module's public API surface. It dispatches commands/queries via the bus, maps domain results to DTOs using dedicated mappers, and handles JWT signing for auth flows. Services replace the previous controller pattern:

```ts
class IdentityService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: IJwtService,
  ) {}

  async loginUser(email: string, password: string): Promise<LoginResponseDTO> {
    const result = await this.commandBus.dispatch(
      new LoginUserCommand(email, password),
    );

    const loginResult = result.getValueOrThrow();
    const { userId, purpose, ttl } = LoginMapper.toSigningParams(loginResult);

    const tokenResult = await this.jwtService.sign(userId, purpose, ttl);
    const token = tokenResult.getValueOrThrow();

    return LoginMapper.toDTO(loginResult.type, token);
  }
}
```

### Handler Contract

Handlers execute sequential steps, checking `isFailure` on each result and returning early:

```ts
async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
  const emailResult = Email.create(command.email);
  if (emailResult.isFailure) return Result.fail(emailResult.error);
  const email = emailResult.value;

  const existing = await this.userRepository.findByEmail(email);
  if (existing) return Result.ok({ type: 'PENDING_VERIFICATION', message: 'Check your email to proceed.' });

  // ... hash, persist, dispatch events, return
}
```

No try/catch in handlers. Failures return as `Result.fail` values and surface as thrown exceptions via `getValueOrThrow()` in the service, landing in `handleServerError`'s catch boundary.

---

## 6. Infrastructure Layer

### Prisma Singleton

Prisma uses a `globalThis` singleton to survive Next.js hot reload in development:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaService };
const prisma = globalForPrisma.prisma ?? new PrismaService();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Repository Implementation

Repository implementations live in `infrastructure/repositories/` with an `.impl.ts` suffix. Prisma-to-domain mappers live in `infrastructure/mappers/`:

```
infrastructure/
  repositories/
    user.repository.impl.ts
    user-profile.repository.impl.ts
    user-session.repository.impl.ts
  mappers/
    user-prisma.mapper.ts
    user-profile-prisma.mapper.ts
    user-session-prisma.mapper.ts
  services/
    password-hasher.service.ts
    id-generator.service.ts
    totp.service.ts
```

### Event Bus

`EventBus` implements `IEventBus`. Every event is persisted to the `domain_events` table in Postgres, then published to QStash for async handler execution. A webhook endpoint (`/api/events`) receives the message and calls `eventBus.process()`, which runs handlers sequentially in registration order and marks the event as processed or failed.

The `domain_events` table serves three roles: durable delivery guarantee (persist before dispatch), audit trail (queryable by aggregate, type, status, timestamp), and failure tracking (attempt count, error message, `replayFailed()` for retry). See the `persist-first-event-dispatch` architecture decision for the full rationale.

### JWT Service

`JwtService` is a plain object singleton implementing `IJwtService`. Uses `jose` (HS256). The `JWT_SECRET` environment variable is required at startup. The service throws a fatal error if missing.

The JWT carries only `userId` in the `sub` claim plus a `type` discriminator. The interface is `sign(sub, type, ttl)` / `verify(token, type)`. Two JWT types are used:

- `JWT_TYPE.ACCESS`: standard access token (15-minute TTL).
- `JWT_TYPE.MFA_CHALLENGE`: short-lived challenge token for MFA verification (5-minute TTL).

`verify()` validates both the cryptographic signature and the `type` claim, rejecting tokens that do not match the expected purpose.

### Feature Flags

Feature flags are stored in the `feature_flags` Prisma table (keyed by tier and feature name) and cached in Upstash Redis:

- `FeatureFlagRepository`: Prisma implementation of `IFeatureFlagRepository`. Queries flags by tier.
- `UpstashFeatureFlagCache`: Redis implementation of `IFeatureFlagCache`. Caches enabled features per user with a 1-hour TTL.

Feature flags are checked in two places:

1. **Server-side.** The `withFeatureFlag` middleware on `next-safe-action` chains. Resolves the user's tier via `identityService.getUserAccount()`, queries flags, caches the result, and throws `FeatureDisabledException` if the feature is not enabled.
2. **Client-side.** The `useFeatureFlags` hook reads cached feature flags from the TanStack Query cache and exposes `isEnabled(feature)` / `isDisabled(feature)` for conditional UI rendering.

### Observability

`ObservabilityService` is a plain object singleton implementing `IObservabilityService`. It uses OpenTelemetry's `@opentelemetry/api` to record handler failures as span attributes:

```ts
const ObservabilityService: IObservabilityService = {
  recordHandlerFailure(handlerName: string, error: unknown): void {
    const span = trace.getActiveSpan();

    if (!span) return;

    const message =
      error instanceof Error ? error.message : 'Unknown error';

    const type =
      error instanceof Error ? error.constructor.name : 'UnknownError';

    span.setAttribute('handler.name', handlerName);
    span.setAttribute('error.type', type);
    span.setAttribute('error.message', message);
    span.setStatus({ code: SpanStatusCode.ERROR, message });
  },
};
```

Events replace application-level logging for audit purposes. The `logger` utility is reserved for infrastructure-level errors.

### Error Response Mapping

`toErrorResponse` maps all thrown values to a stable external shape. Domain exceptions are checked first, then Zod validation errors, then Prisma errors by code, with a catch-all for anything unexpected. See [`to-error-response.util.ts`](https://github.com/ctsmith2308/ledger/blob/master/src/core/shared/infrastructure/utils/to-error-response.util.ts) for the full mapping.

---

## 7. Transport Layer

### `next-safe-action` — the action framework

All server actions are created via `next-safe-action`. The `actionClient` is configured with a `handleServerError` catch boundary that maps all thrown errors through `toErrorResponse`, a metadata schema for action naming, and a chained `.use()` middleware that wraps every action in an OpenTelemetry span. See [`action-client.ts`](https://github.com/ctsmith2308/ledger/blob/master/src/app/_shared/lib/next-safe-action/action-client.ts) for the full configuration.

Actions chain middleware inline using `.use()` and declare input schemas via `.inputSchema()`:

```ts
// Unprotected. Rate-limited, schema-validated.
const loginAction = actionClient
  .metadata({ actionName: 'loginUser' })
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    const response = await identityService.loginUser(
      parsedInput.email,
      parsedInput.password,
    );

    if (response.type === 'SUCCESS') {
      await setCookie(response.token);
      return;
    }

    return { challengeToken: response.token };
  });

// Protected. Auth resolved, feature-flagged.
const setupMfaAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.MFA))
  .action(async ({ ctx }) => {
    return identityService.setupMfa(ctx.userId);
  });
```

### Middleware

Middleware is defined in `_shared/lib/next-safe-action/middleware/` using `createMiddleware()`:

- **`withAuth`**: reads the session cookie, verifies the JWT via `JwtService.verify(token, JWT_TYPE.ACCESS)`, and injects `{ userId }` into `ctx`. Throws `UnauthorizedException` if missing or invalid.
- **`withFeatureFlag(feature)`**: resolves the user's tier, checks the feature flag cache (falls back to the database), and throws `FeatureDisabledException` if the feature is not enabled for the user's tier.
- **`withRateLimit`**: enforces request rate limits.

### `handleActionResponse` — the serialization bridge

`handleActionResponse` bridges the gap between next-safe-action's result shape and TanStack Query's error expectations:

```ts
const handleActionResponse = async <T>(
  response: Promise<SafeActionResponse<T>>,
): Promise<T> => {
  const result = await response;

  if (result.serverError) {
    throw new ActionError(result.serverError.code, result.serverError.message);
  }

  if (result.validationErrors) {
    throw new ActionError('VALIDATION_ERROR', 'The request contains invalid data.');
  }

  return result.data as T;
};
```

Feature hooks call `handleActionResponse(action(input))` inside `useMutation`. If the action fails, `handleActionResponse` throws an `ActionError` with the stable error code and message. TanStack Query catches it, `retry` checks `error.code` (skipping non-retryable codes like `UNAUTHORIZED` and `RATE_LIMIT_EXCEEDED`), and global `onError` toasts the message.

### Full request flow

```
Client calls handleActionResponse(loginAction({ email, password }))
  → next-safe-action chain enters
    → withRateLimit, enforce rate limit
    → .inputSchema(loginUserSchema), Zod validates input
    → .action() handler executes
      → identityService.loginUser(email, password)
        → commandBus.dispatch(new LoginUserCommand(...))
          → LoginUserHandler.execute()
            → Email.create(), Password.create(), domain validation
            → userRepository.findByEmail()
            → hasher.verify()
            → user.loggedIn(), raises UserLoggedInEvent
            → pullDomainEvents() + eventBus.dispatch()
            → Result.ok({ type: 'SUCCESS', user })
        → service signs JWT via jwtService.sign(userId, JWT_TYPE.ACCESS, '15m')
        → returns { type: 'SUCCESS', token }
      → setCookie(token), httpOnly cookie
      → returns void (success with no data)
  → next-safe-action returns { data: undefined }
  → handleActionResponse unwraps, returns undefined

On any throw:
  → handleServerError catches. logger.error(error), toErrorResponse maps to { code, message }
  → next-safe-action returns { serverError: { code, message } }
  → handleActionResponse sees serverError, throws ActionError(code, message)
  → TanStack Query onError, global toast handler
```

### Auth flow

```
loginAction → identityService.loginUser() → signs JWT (userId in sub)
  → MFA disabled: { type: 'SUCCESS', token } → setCookie(token)
  → MFA enabled:  { type: 'MFA_REQUIRED', token } → returned as challengeToken

verifyMfaLoginAction → identityService.verifyMfaLogin(challengeToken, totpCode)
  → verifies MFA_CHALLENGE JWT, validates TOTP code
  → signs new ACCESS JWT → { token } → setCookie(token)

proxy.ts (Next.js edge middleware, exported as `middleware`)
  → reads session cookie
  → JwtService.verify(token, JWT_TYPE.ACCESS)
  → invalid/missing → redirect /login
  → valid → NextResponse.next()

withAuth middleware (on protected server actions)
  → getCookie() → JwtService.verify(token, JWT_TYPE.ACCESS)
  → injects { userId } into ctx

loadSession() (for React Server Components)
  → React.cache() wrapped. getCookie() → JwtService.verify()
  → returns { userId }
```

### Cookie Helpers

Session cookies are managed via standalone helpers in `_shared/lib/session/session.service.ts`:

- `setCookie(token)`: sets an httpOnly, secure, sameSite=lax cookie.
- `deleteCookie()`: clears the session cookie.
- `getCookie()`: reads the cookie value.
- `loadSession()`: `React.cache()` wrapper that reads the cookie, verifies the JWT, and returns `{ userId }`. Used in React Server Components for session resolution.

---

## 8. Frontend — Feature-Sliced Design (lite)

This project applies a **lite variant of Feature-Sliced Design**, the same layered model and one-way dependency rules, without the full FSD specification. Analogous to "DDD-lite": the discipline is real, the ceremony is reduced.

The [official FSD specification](https://feature-sliced.design/overview) defines additional conventions around slice/segment naming, public API enforcement via index files, and cross-import rules that are stricter than what is applied here. The full spec is worth reading if you want the complete picture. What this project takes from FSD:

- The **layer names and responsibilities** (shared, entities, components, widgets, providers, features)
- The **one-way dependency rule**: lower layers never import from higher ones.
- The **barrel index** convention: consumers import from `index.ts`, never from internal paths.
- The **feature isolation** rule: features never import from other features.

What is not strictly followed:

- FSD defines formal **slices** (domain groupings within a layer) and **segments** (`ui/`, `model/`, `api/`) with specific naming conventions. This project uses a simpler structure within features.
- FSD's public API enforcement is by convention here, not enforced by a linter. `eslint-plugin-boundaries` would close this gap.

---

FSD enforces strict one-way dependencies between UI layers. Lower layers never import from higher ones.

| Layer | Directory | Responsibility |
|---|---|---|
| shared | `_shared/` | Cross-cutting libraries, utilities, session management, action client. Base layer. |
| components | `_components/` | Primitive, stateless UI: button, input, card. No feature dependencies. |
| providers | `_providers/` | App-level context: theme, query. |
| entities | `_entities/` | Data access layer grouped by domain. Server actions, action-level schemas, entity hooks. |
| features | `_features/` | Domain feature modules. Each owns hooks, UI, and feature-specific schemas. |
| widgets | `_widgets/` | Compositional blocks that assemble features into page sections. |

**Dependency rule:** `_shared` -> `_components` -> `_entities` -> `_features` -> `_widgets` -> pages. Layers import from layers below, never above. Features never import from other features. Entities never import from features, widgets, or components. Widgets can import from features (that is their job: composing features into page sections).

Each layer exposes a barrel `index.ts`. Consumers import from the barrel, never from deep internal paths. This means a layer's internal structure can change without touching any import paths outside it.

### Entity module structure

Entities are the data access layer. They own server actions, action-level Zod schemas, and entity-level hooks. Entities do not know about UI, TanStack Query mutations, or feature-specific logic.

```
_entities/identity/
  actions/
    login.action.ts               # 'use server'. Calls identityService, sets cookie.
    register.action.ts
    setup-mfa.action.ts
    verify-mfa-login.action.ts
    index.ts
  hooks/
    use-session.hook.ts            # session state hook
    use-feature-flags.hook.ts      # reads feature flags from query cache
    index.ts
  schema/
    login.schema.ts                # Zod schema for login input
    register.schema.ts
    verify-mfa.schema.ts
    fields.ts                      # shared field validators
    index.ts
```

### Feature module structure

Features compose entity actions into hooks that wrap them with TanStack Query. Features own hooks, UI, and feature-specific form schemas. Components are dumb: they consume the hook's return value and render.

```
_features/auth/
  hooks/
    use-login-form.hook.ts         # TanStack Form + useMutation wrapping handleActionResponse
    use-register-form.hook.ts
    use-logout.hook.ts
    use-mfa-verify-form.hook.ts
    index.ts
  ui/
    login-form.tsx                 # uses hooks + _components only
    register-form.tsx
    mfa-verify-form.tsx
    logout-button.tsx
    index.ts
```

---

## 9. Validation Strategy

Validation occurs at two explicit boundaries:

### Transport boundary — `next-safe-action` `.inputSchema()`

Zod schemas are declared on the action chain via `.inputSchema()`. next-safe-action runs `safeParse` before the handler executes. Invalid input never reaches the service layer.

```ts
const loginAction = actionClient
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    // parsedInput is fully typed and validated
    return identityService.loginUser(parsedInput.email, parsedInput.password);
  });
```

Schemas live in the entity layer (`_entities/<domain>/schema/`), co-located with the actions they validate. Feature-specific form schemas (e.g., client-side-only validation) live in the feature layer (`_features/<domain>/schema/`).

### Domain boundary — value objects

Value objects enforce business invariants at construction. Schema validation ensures structural correctness; value objects enforce business rules:

```ts
const emailResult = Email.create(command.email); // enforces valid format
const passwordResult = Password.create(command.password); // enforces strength rules
```

| | `.inputSchema()` | Value objects |
|---|---|---|
| Layer | Transport (next-safe-action) | Domain |
| Validates | Shape and types | Business invariants |
| Fails with | Zod validation error -> `VALIDATION_ERROR` | `DomainException` -> `VALIDATION_ERROR` |
| Swappable | Yes (replace Zod) | No, these are the rules |

Both map to the same `VALIDATION_ERROR` response externally.

---

## 10. Security Considerations

- **User enumeration prevention**: Registration returns `PENDING_VERIFICATION` regardless of whether the email already exists. Login returns a generic failure for both "email not found" and "password incorrect" cases. The external response is identical; the internal exception is distinct for logging.
- **Password storage**: Argon2 via `argon2` package. Passwords are hashed before persistence; the domain never stores or logs plaintext passwords.
- **JWT**: HS256 via `jose`. Carries only `userId` in the `sub` claim and a `type` discriminator (`ACCESS` or `MFA_CHALLENGE`). Stored in an httpOnly cookie, not accessible from JavaScript. Verified in both the edge proxy (`proxy.ts`) and `withAuth` middleware for protected server actions.
- **MFA**: TOTP-based multi-factor authentication. When MFA is enabled, login returns a short-lived `MFA_CHALLENGE` JWT (5-minute TTL) instead of an access token. The client submits the challenge token with a TOTP code to `verifyMfaLogin`, which validates both before issuing an access token. MFA setup and verification are gated behind the `FEATURE_KEYS.MFA` feature flag.
- **Feature flags**: Server-side feature gating via the `withFeatureFlag` middleware. Flags are stored in Prisma and cached in Upstash Redis. Disabled features throw `FeatureDisabledException`, which maps to a stable `FEATURE_DISABLED` error code.
- **Input validation**: All action inputs are validated via Zod schemas declared on the `next-safe-action` chain. Unvalidated data never reaches the service or domain layers.
- **Prisma**: Parameterised queries only. No raw SQL in the current codebase.
- **Rate limiting**: The `withRateLimit` middleware enforces request rate limits on sensitive actions (login, registration).

---

## 11. Concepts & Further Reading

If you are new to the patterns in this codebase, start with the annotated building blocks in `src/core/shared/domain/`. Each file has a block comment explaining what the concept is and how it is used here.

### Code map

| Concept | File | What it does |
|---|---|---|
| Value Object | `shared/domain/value-object.ts` | Immutable, identity-by-value. `Email`, `Password`, `UserId` extend this. |
| Aggregate Root | `shared/domain/aggregate-root.ts` | Consistency boundary. Collects domain events during mutations. |
| Domain Event | `shared/domain/domain-event.ts` | Records that something meaningful happened. Persisted for audit. |
| Result | `shared/domain/result.ts` | Monadic success/failure. Every domain operation returns this instead of throwing. |
| Command | `shared/domain/bus/command.ts` | Mutates state. Phantom type drives return type inference at dispatch. |
| Query | `shared/domain/bus/query.ts` | Returns data without mutation. Same phantom type pattern. |
| IHandler | `shared/domain/handler.ts` | Application layer contract. Orchestrates domain operations. |
| IEventBus | `shared/domain/bus/event-bus.interface.ts` | Domain abstraction for event delivery. Implementation is swappable. |
| Repository | `modules/identity/domain/repositories/user.repository.ts` | Domain-shaped persistence interface. Implementation lives in infrastructure. |
| CommandBus | `shared/infrastructure/bus/command-bus.impl.ts` | Dispatches commands to handlers with OpenTelemetry tracing. |
| EventBus | `shared/infrastructure/bus/event-bus.impl.ts` | Persists events to Postgres, publishes to QStash for async handler execution. |

### Recommended reading

**Domain-Driven Design:**
- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (2003). The original. Chapters 5-6 (Entities, Value Objects, Aggregates) map directly to this codebase.
- Vaughn Vernon, *Implementing Domain-Driven Design* (2013). More practical than Evans. Chapter 10 (Aggregates) is particularly relevant.
- Martin Fowler, [DDD Aggregate pattern](https://martinfowler.com/bliki/DDD_Aggregate.html). Short overview of aggregate design rules.

**CQRS and Event-Driven Architecture:**
- Greg Young, [CQRS Documents](https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf). The foundational paper. Explains why commands and queries are separated and what that enables.
- Martin Fowler, [CQRS](https://martinfowler.com/bliki/CQRS.html). Concise overview with guidance on when CQRS is and isn't justified.
- Martin Fowler, [Domain Event](https://martinfowler.com/eaaDev/DomainEvent.html). What domain events are and how they differ from system events.

**Clean Architecture:**
- Robert C. Martin, [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html). The dependency rule (inner layers never depend on outer layers) is the core principle of this codebase.
- Robert C. Martin, *Clean Architecture* (2017). Chapters 20-22 cover the dependency inversion that drives the repository interface pattern used here.

**Result Type / Railway-Oriented Programming:**
- Scott Wlaschin, [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/). The conceptual foundation for the Result type pattern. Written for F# but the ideas are language-agnostic.

**Feature-Sliced Design:**
- [Official FSD documentation](https://feature-sliced.design/docs/get-started/overview). The full specification. This codebase applies a lite variant: the layer hierarchy and one-way dependency rules are followed, but formal slice/segment naming and strict public API enforcement are not.
- [FSD Layer reference](https://feature-sliced.design/docs/reference/layers). Defines the seven layers (shared, entities, features, widgets, pages, processes, app) and the "import only from layers strictly below" rule.
