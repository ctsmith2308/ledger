# Architecture

This document is the authoritative record of architectural decisions, experiments, and the reasoning behind each pivot. It exists to answer the "why" questions — not just what the current architecture is, but what was tried before it and why it was abandoned.

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

---

## 1. The Core Principle

The domain knows nothing about Next.js, Prisma, tRPC, or HTTP. It only knows about business rules.

Every architectural decision in this project flows from that constraint. The transport layer calls domain handlers. Domain handlers return results. The transport layer maps those results to responses. Swapping any layer outside `src/core/` leaves the domain untouched. This was proven when the project migrated from NestJS → Next.js, then added and removed tRPC, without touching a single file in `src/core/modules/`.

---

## 2. Evolutionary History

### Phase 1 — NestJS + Fastify + Nuxt monorepo

**Commits:** `660b3e0` through `9c11054`
**Duration:** ~1 week

The initial architecture was a three-service monorepo:

```
apps/
  ledger-api-core/      # NestJS — domain logic, CQRS, Prisma
  ledger-api-gateway/   # Fastify — auth middleware, routing, proxying
  ledger-frontend/      # Nuxt 3 — Vue frontend
docker-compose.yml      # wired all three together
```

**What was built:**

`ledger-api-core` was a full NestJS application with genuine DDD structure — aggregates, value objects, repository interfaces, domain events. The architecture was sound. The framework wiring was the problem.

`ledger-api-gateway` was a Fastify server with:
- Auth middleware stub (`middleware/auth.middleware.ts`)
- Route groups for app health, intelligence, and webhooks
- Intended to proxy to `ledger-api-core` and eventually other backend services

`ledger-frontend` was a Nuxt 3 application with a Vue frontend.

**The NestJS boilerplate in practice:**

NestJS `CqrsModule` requires decorating every handler with `@CommandHandler` or `@QueryHandler`, registering it in the module's `providers` array, and using custom IoC tokens with `@Inject()` for interface-typed dependencies. Here is what the actual wiring looked like:

```ts
// identity.module.ts — providers array required for every handler and service
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
// identity.providers.ts — explicit token-to-class mappings for every interface
const IdentityInfrastructureProviders: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserRepository },
  { provide: ID_GENERATOR,    useClass: UuIdV4IdGenerator },
  { provide: PASSWORD_HASHER, useClass: ArgonPasswordHasher },
];
```

```ts
// register-user.handler.ts — @CommandHandler ties handler to NestJS CqrsModule;
// @Inject() resolves interface dependencies via IoC token strings
@CommandHandler(RegisterUserCommand)
class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(ID_GENERATOR)    private readonly idGenerator: IIdGenerator,
    private readonly eventBus: EventBus, // NestJS EventBus — not IEventBus
  ) {}

  async execute(command: RegisterUserCommand) { ... }
}
```

Every new handler required: a `@CommandHandler` decorator, a `providers` array entry in the module, and a token constant (`USER_REPOSITORY`, `PASSWORD_HASHER`, etc.) for each injected interface. This is not unique to this project — it is the prescribed NestJS pattern. It works at scale with a large team. For a single developer, it was ceremony that obscured rather than clarified.

**Why it was abandoned:**

- **IoC token boilerplate**: Every interface dependency requires a string/symbol token (`USER_REPOSITORY`), a corresponding `{ provide: TOKEN, useClass: Impl }` provider entry, and an `@Inject(TOKEN)` decorator on the constructor parameter. The overhead compounds with each new handler.
- **Implicit dependency graph**: A missing provider entry throws at runtime — `Nest can't resolve dependencies of X`. TypeScript cannot catch this at compile time because the IoC container resolves tokens at startup, not at type-check time.
- **`@CommandHandler` decorator lock-in**: `@CommandHandler(RegisterUserCommand)` and `implements ICommandHandler` are NestJS primitives. The handler cannot be instantiated or tested without bootstrapping the NestJS IoC container, or at minimum mocking it.
- **NestJS `EventBus` vs `IEventBus`**: The event bus was injected as NestJS's own `EventBus` type — not the domain interface. This meant the handler had a direct NestJS dependency at the application layer, which should be framework-agnostic.
- **Three-service overhead**: Running a Fastify gateway in front of a NestJS service for a single-developer portfolio project is operational ceremony with no current benefit. The gateway pattern is correct at scale; it is premature here.

The domain core (`src/core/`) — value objects, aggregates, handlers — survived this phase intact and transferred directly to the Next.js monolith. The NestJS-specific wiring was the only casualty.

**What was kept:**

Everything in `src/core/`. The DDD structure, `Result<T, E>` type, value objects, repository interfaces, and the handler concept (`execute(command)`) were designed framework-agnostic from the start. They moved without modification. `@CommandHandler` became `commandBus.register()`. `@Inject(USER_REPOSITORY)` became a constructor parameter. The domain logic was identical.

---

### Phase 2 — Collapse to Next.js

**Commit:** `d319766`

The three-service monorepo was collapsed into a single Next.js application. The Fastify gateway and NestJS service were removed. Prisma was wired directly.

**What this introduced:**

The first version of what became `createAction` — a set of middleware-style utilities:

```ts
// Early middleware approach — composed manually per action
withAuth(withLogger(withValidation(registerUserSchema)(handler)));
```

This was functional but verbose. Each action required explicit composition of middleware in the right order, and there was no consistent response shape guarantee. It evolved into the `createAction` HOF in the next phase.

**Dependency wiring** moved from NestJS IoC to explicit manual wiring:

```ts
// identity.module.ts — explicit, visible, compile-time safe
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
| API layer | tRPC — adapter swap to port | Next.js only |
| Auth | httpOnly cookie via tRPC context | Next.js session/cookie handling |
| Server state | TanStack Query — React, Vue, Svelte adapters | `use()`, `useFormState()` — React only |
| Type safety | End-to-end via tRPC, no code generation | Server action return types only |
| Middleware | Once in `procedure.ts`, applied everywhere | Per-action wrapper (HOF) |
| Bundle | tRPC client + TanStack Query | Zero additional client bundle |

The portability argument was genuine. Swapping Next.js for SvelteKit would mean:
- Replace `@tanstack/react-query` with the Vue/Svelte adapter
- Replace the Next.js route handler with the target framework's equivalent
- `src/core/` and the tRPC procedures are untouched

**Why it was abandoned:**

The portability argument is compelling when framework portability is a real requirement. It is not for this project. The decisive factors:

1. **No migration on the roadmap.** Carrying tRPC's mental model, the adapter wiring, and TanStack Query setup for a benefit that would never be realised was ceremony without payoff.
2. **Server actions already provide the core benefit.** The main value of tRPC's `procedure.ts` middleware chain — a shared auth check and a consistent response shape — was achievable with a simpler HOF pattern (`createAction`).
3. **Bundle cost.** Server actions add zero client bundle overhead. tRPC requires the tRPC client and TanStack Query on the client.

The `createAction` HOF that replaced it replicates the only tRPC features this project actually used. See [Phase 4](#phase-4--server-actions-only) and [Transport Layer](#7-transport-layer).

---

### Phase 4 — Server actions only

**Commit:** `4278357`

tRPC was removed. All server actions were created via `createAction`. The `withAuth`/`withLogger`/`withValidation` middleware composition from Phase 2 was consolidated into a single HOF with a discriminated union config type.

**What `createAction` recovered from tRPC:**

| tRPC feature | createAction equivalent |
|---|---|
| `protectedProcedure` middleware | `protected: true` config — session resolved before handler |
| Consistent response shape | `_toSuccess` / `_toFailure` mappers — always `ActionResult<T>` |
| Single catch boundary | Single `try/catch` in the factory — handles domain, Zod, and unexpected errors |
| Type-safe return | Server action return types inferred by TypeScript |

**What was genuinely lost:**

Framework portability. The action layer is now coupled to Next.js. The domain (`src/core/`) remains portable — zero Next.js dependencies. But the transport layer would need to be rewritten, not re-adapted, for a framework migration. Acceptable for a portfolio project. Not acceptable for a product with an uncertain frontend future.

---

### Phase 5 — Command Bus / Query Bus

**Commit:** `54810fd`

The `identityModule` object that previously wired handlers directly was replaced with a `CommandBus` and `QueryBus`. Each command lives in its own folder and self-registers against the bus on import.

**What this solved:**

The identity module was becoming a dependency wiring file — every new handler required instantiating its dependencies and adding an entry to the module object. Call sites had to know which module owned which handler. As command count grows, both problems compound.

**The phantom type approach:**

```ts
abstract class Command<TResponse = unknown> {
  declare readonly _response: TResponse; // compile-time only — zero runtime cost
}
```

`dispatch()` return types are inferred without an explicit generic at the call site:

```ts
// Return type is LoginUserResponse — TypeScript infers it from the phantom field
const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
```

See [Application Layer — Command Bus](#command-bus--query-bus) for the full implementation.

---

## 3. Current Architecture

```
src/
  core/                           # framework-agnostic domain and application logic
    modules/
      indentity/                  # identity bounded context
        domain/                   # pure business rules — no infrastructure dependencies
        application/              # commands, queries, handlers
          commands/
            login-user/           # command + handler + bus registration
            register-user/
          queries/
            get-user-profile/
        infrastructure/           # Prisma repository, password hasher, id generator
        _deps.ts                  # shared infrastructure instances for this module
        identity.module.ts        # side-effect imports trigger bus registration
    shared/
      domain/                     # shared domain primitives
        exceptions/               # typed domain exceptions
        services/                 # IEventBus, IJwtService interfaces
        aggregate-root.ts
        bus.ts                    # Command<T> and Query<T> base classes
        domain-event.ts
        handler.ts                # IHandler<TRequest, TResponse>
        result.ts                 # Result<T, E>
        value-object.ts
      infrastructure/             # shared infrastructure implementations
        bus/                      # CommandBus, QueryBus singletons
        persistence/              # Prisma singleton, PrismaService
        services/                 # JwtService, InProcessEventBus, TelemetryService
        utils/                    # SchemaValidator, logger, toErrorResponse

  app/                            # Next.js app — transport and UI layer
    _lib/                         # shared utilities, factories, services
      factories/                  # createAction HOF
      services/                   # SessionService
      utils/                      # cn (tailwind merge)
      content/                    # portfolio copy — architecture decisions, case studies
    _components/                  # primitive, stateless UI
    _widgets/                     # compositional UI blocks
    _providers/                   # app-level context
    _features/                    # domain feature modules
      auth/
        actions/                  # server actions — thin transport wrappers
        composables/              # client hooks (TanStack Form)
        ui/                       # feature-specific components
    (auth)/                       # auth route group with shared centered layout
    (dashboard)/                  # dashboard route group with shared header layout
    architecture/                 # portfolio — architecture decision pages
    case-studies/                 # portfolio — case study pages
```

---

## 4. Domain Layer

### Value Objects

Value objects validate invariants at construction time via a `Result`-returning static factory. Invalid state is unrepresentable — a handler that receives an `Email` instance has a guarantee it is valid.

```ts
class Email {
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
};
```

Validation logic is extracted into a private `_validate` helper so invariant rules are named, isolated, and directly testable without constructing the value object.

### Aggregates

Aggregates are the consistency boundary. They raise domain events, enforce invariants, and are persisted as a unit.

```ts
class User extends AggregateRoot {
  static register(id: UserId, email: Email, passwordHash: Password): User {
    const user = new User(id, email, passwordHash);
    user.addDomainEvent(new UserRegisteredEvent(id.value, email.address));
    return user;
  }
}
```

### Domain Events

Events are raised on the aggregate, stored internally, and pulled after persistence:

```ts
// In the handler — after save
const events = user.pullDomainEvents();
await this.eventBus.dispatch(events);
```

Pulling after save prevents dispatching events for operations that fail to persist. Current events: `UserRegisteredEvent`, `UserLoggedInEvent`.

### Result Type

All domain operations return `Result<T, E>` — never throw directly. Unwrapping uses `getValueOrThrow()` on its own line:

```ts
// Correct — stack trace points to the exact line
const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
const { jwt } = result.getValueOrThrow();

// Wrong — hard to trace in stack
const { jwt } = (await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password))).getValueOrThrow();
```

### Repository Interfaces

Repository interfaces are defined in the domain layer — no Prisma imports, no infrastructure dependencies:

```ts
// domain/repositories/user.repository.ts
interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

Implementations live in `infrastructure/repository/` and are wired via `_deps.ts`. The domain can be unit tested with a mock `IUserRepository` — no database required.

---

## 5. Application Layer

### CQRS

Commands mutate state and return `Result`. Queries return data and do not mutate state. Handlers implement `IHandler<TRequest, TResponse>`:

```ts
interface IHandler<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}
```

No decorators, no IoC tokens — a typed contract that enforces the `execute` signature consistently.

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

`CommandBus.register` uses `{ name: string; prototype: T }` as the class token type — avoids `Function` and `any` while letting TypeScript infer `T` from the class prototype:

```ts
register<T extends AnyCommand>(
  CommandClass: { name: string; prototype: T },
  handler: IHandler<T, T['_response']>,
): void {
  this._handlers.set(CommandClass.name, handler as IHandler<AnyCommand, unknown>);
}
```

### Self-Registration Pattern

Each command folder registers its own handler as a side effect of being imported:

```ts
// commands/login-user/index.ts
commandBus.register(
  LoginUserCommand,
  new LoginUserHandler(_repo, _eventBus, _passwordHasher, _jwtService),
);

export { LoginUserCommand };
export type { LoginUserResponse } from './login-user.command';
```

`identity.module.ts` imports each command folder — three lines, no handler instantiation:

```ts
import './application/commands/login-user';
import './application/commands/register-user';
import './application/queries/get-user-profile';
```

Adding a new command requires one new folder. Nothing else changes.

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

No try/catch in handlers. Failures return as `Result.fail` values and surface as thrown exceptions via `getValueOrThrow()`, landing in `createAction`'s catch boundary.

---

## 6. Infrastructure Layer

### Prisma Singleton

Prisma uses a `globalThis` singleton to survive Next.js hot reload in development:

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaService };
const prisma = globalForPrisma.prisma ?? new PrismaService();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### In-Process Event Bus

`InProcessEventBus` implements `IEventBus`. Handlers run in parallel via `Promise.all`. The interface is defined in the domain layer — swapping to a durable queue (SQS, RabbitMQ) is a one-line change in `_deps.ts` with zero domain impact:

```ts
// Today
const _eventBus = new InProcessEventBus();

// Tomorrow — zero domain changes
const _eventBus = new SqsEventBus(sqsClient, QUEUE_URL);
```

**Known limitation:** In-process delivery is not durable. A process crash between save and dispatch loses events. Acceptable for audit logs at this scale; not acceptable for financial operations at scale.

### JWT Service

`JwtService` is a plain object singleton implementing `IJwtService`. Uses `jose` (HS256). The `JWT_SECRET` environment variable is required at startup — the service throws a fatal error if missing.

**Known TODOs:** expiration time, audience/issuer claims, test setup.

### Error Response Mapping

`toErrorResponse` maps all thrown values to a stable external shape. Prisma errors are mapped by code before domain exceptions:

```ts
const prismaErrorMap: Record<string, ErrorResponse> = {
  P2002: domainTypeMap.CONFLICT,      // unique constraint
  P2025: domainTypeMap.NOT_FOUND,     // record not found
  P2003: domainTypeMap.CONFLICT,      // foreign key constraint
};
```

---

## 7. Transport Layer

### `createAction` — the action factory

All server actions are created via `createAction`. It provides:
- Optional session resolution (`protected: true`) — injects `AuthUser` before handler runs
- Single catch boundary — `DomainException`, `ZodError`, and unexpected errors all land here
- Consistent `ActionResult<T>` response shape via `_toSuccess` / `_toFailure` mappers

```ts
// Unprotected
const loginAction = createAction({
  handler: async (input: unknown) => {
    const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();
    const result = await commandBus.dispatch(new LoginUserCommand(dto.email, dto.password));
    const { jwt } = result.getValueOrThrow();
    SessionService.set(jwt);
  },
});

// Protected — session resolved and injected
const getProfileAction = createAction({
  protected: true,
  handler: async (session: AuthUser, input: unknown) => {
    const result = await queryBus.dispatch(new GetUserProfileQuery(session.id));
    return result.getValueOrThrow();
  },
});
```

### Full request flow

```
Client calls action (e.g. loginAction(formData))
  → createAction catch boundary enters
    → protected: true — SessionService.get().getValueOrThrow() — throws if invalid
    → handler(input) executes
      → SchemaValidator.parse() — throws ValidationException if invalid
      → commandBus.dispatch(new LoginUserCommand(...))
        → LoginUserHandler.execute()
          → Email.create(), Password.create() — domain validation
          → userRepository.findByEmail()
          → hasher.verify()
          → jwtService.sign()
          → eventBus.dispatch([UserLoggedInEvent])
          → Result.ok({ jwt })
      → result.getValueOrThrow() — throws DomainException on failure
    → _toSuccess({ jwt })
  → ActionResult<{ jwt: string }> { success: true, data: { jwt } }

On any throw:
  → _toFailure(err) — toErrorResponse maps to stable code + message
  → ActionResult { success: false, code, message }
```

### Auth flow

```
loginAction → identityModule → SessionService.set(jwt) → httpOnly cookie

middleware.ts (Next.js edge middleware)
  → reads 'session' cookie
  → JwtService.verify(token)
  → invalid/missing → redirect /login
  → valid → NextResponse.next()

createAction({ protected: true })
  → SessionService.get() → JwtService.verify(token)
  → injects AuthUser into handler
```

---

## 8. Frontend — Feature-Sliced Design (lite)

This project applies a **lite variant of Feature-Sliced Design** — the same layered model and one-way dependency rules, without the full FSD specification. Analogous to "DDD-lite": the discipline is real, the ceremony is reduced.

The [official FSD specification](https://feature-sliced.design/overview) defines additional conventions around slice/segment naming, public API enforcement via index files, and cross-import rules that are stricter than what is applied here. The full spec is worth reading if you want the complete picture. What this project takes from FSD:

- The **layer names and responsibilities** (lib, components, widgets, providers, features)
- The **one-way dependency rule** — lower layers never import from higher ones
- The **barrel index** convention — consumers import from `index.ts`, never from internal paths
- The **feature isolation** rule — features never import from other features

What is not strictly followed:

- FSD defines formal **slices** (domain groupings within a layer) and **segments** (`ui/`, `model/`, `api/`) with specific naming conventions. This project uses a simpler structure within features.
- FSD's public API enforcement is by convention here, not enforced by a linter. `eslint-plugin-boundaries` would close this gap.

---

FSD enforces strict one-way dependencies between UI layers. Lower layers never import from higher ones.

| Layer | Directory | Responsibility |
|---|---|---|
| lib | `_lib/` | Shared utilities, factories, services. Base layer. |
| components | `_components/` | Primitive, stateless UI — button, input, card. No feature dependencies. |
| widgets | `_widgets/` | Compositional blocks — headers, footers, dashboard shell. |
| providers | `_providers/` | App-level context — theme, auth. |
| features | `_features/` | Domain feature modules. Each owns actions, composables, and UI. |

**Dependency rule:** `_lib` → `_components` → `_widgets` → `_features` → routes. No layer imports from above itself. Features never import from other features. Cross-feature sharing belongs in `_lib` or `_components`.

Each layer exposes a barrel `index.ts`. Consumers import from the barrel, never from deep internal paths. This means a layer's internal structure can change without touching any import paths outside it.

### Feature module structure

```
_features/auth/
  actions/
    login.action.ts       # 'use server' — calls commandBus, thin wrapper
    register.action.ts
    index.ts
  composables/
    use-login-form.ts     # TanStack Form + action mutation
    use-register-form.ts
    index.ts
  ui/
    login-form.tsx        # uses composables + _components only
    register-form.tsx
    index.ts
```

---

## 9. Validation Strategy

Validation occurs at two explicit boundaries:

### Transport boundary — `SchemaValidator`

Wraps Zod `safeParse`, returns `Result<T, ValidationException>`. Validates shape and types before the payload reaches the domain.

```ts
const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();
```

Swapping Zod means replacing `SchemaValidator` once. The domain and all handlers are untouched.

### Domain boundary — value objects

Value objects enforce business invariants at construction. Schema validation ensures structural correctness; value objects enforce business rules:

```ts
const emailResult = Email.create(command.email); // enforces valid format
const passwordResult = Password.create(command.password); // enforces strength rules
```

| | `SchemaValidator` | Value objects |
|---|---|---|
| Layer | Infrastructure | Domain |
| Validates | Shape and types | Business invariants |
| Fails with | `ZodError` → `VALIDATION_ERROR` | `DomainException` → `VALIDATION_ERROR` |
| Swappable | Yes | No — these are the rules |

Both map to the same `VALIDATION_ERROR` response externally.

---

## 10. Security Considerations

- **User enumeration prevention**: Registration returns `PENDING_VERIFICATION` regardless of whether the email already exists. Login returns a generic failure for both "email not found" and "password incorrect" cases. The external response is identical; the internal exception is distinct for logging.
- **Password storage**: Argon2 via `argon2` package. Passwords are hashed before persistence; the domain never stores or logs plaintext passwords.
- **JWT**: HS256 via `jose`. Stored in an httpOnly cookie — not accessible from JavaScript. Verified in both Next.js edge middleware and `createAction` for protected actions.
- **Input validation**: All action inputs are typed as `unknown`. Schema validation is the handler's first step — unvalidated data never reaches the domain.
- **Prisma**: Parameterised queries only. No raw SQL in the current codebase.
