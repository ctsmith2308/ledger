# Architecture

This document covers the deliberate architectural decisions made in this project and the reasoning behind them. This project is an experiment and case study in pragmatic, framework-agnostic application architecture using Next.js Server Actions as the transport layer over a pure domain core.

## The Core Principle — Domain Purity

The domain knows nothing about Next.js, server actions, cookies, or HTTP. It only knows about business rules. The transport layer (server actions) and the domain are deliberately kept separate — server actions call domain handlers, domain handlers return results, server actions map those results to responses.

This means swapping the transport layer leaves `src/core/` completely untouched.

## DDD-Lite — Pragmatic Domain Driven Design

Full DDD with a framework like NestJS wires dependencies at runtime via an IoC container. Decorators like `@Injectable()` and `@InjectRepository()` instruct the container to resolve and inject dependencies automatically — powerful, but opaque.

Here dependencies are wired explicitly at startup:

```ts
// identity.module.ts
const repo = new UserRepository(prisma);

const identityModule = {
  registerUser: new RegisterUserHandler(repo, PasswordHasher, IdGenerator),
  loginUser: new LoginUserHandler(repo, PasswordHasher, JwtService),
};
```

No magic, no runtime surprises. If a dependency is missing TypeScript catches it at compile time. The tradeoff is manual wiring, but at this scale that is a feature not a bug — the full dependency graph is always visible and explicit.

This approach is sometimes called "poor man's DDD" — domain boundaries, value objects, aggregates, and explicit dependency wiring without a framework enforcing it.

### Handler Contract

Handlers are typed via a simple `IHandler<TRequest, TResponse>` interface:

```ts
interface IHandler<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

class RegisterUserHandler implements IHandler<RegisterUserCommand, RegisterUserResponse> {
  execute(command: RegisterUserCommand): Promise<RegisterUserResponse> { ... }
}
```

No decorators, no IoC tokens — just a typed contract that self-documents intent and enforces the `execute` signature consistently across all handlers.

## Feature-Sliced Design (FSD) — UI Layer

The `src/app/` directory follows FSD conventions. Each layer has a single, explicit responsibility and dependencies flow strictly one way — lower layers never import from higher ones.

| Layer | Directory | Responsibility |
|---|---|---|
| components | `_components/` | Primitive, stateless UI (button, input, card). Flat, no subdirectories. |
| widgets | `_widgets/` | Compositional UI blocks combining primitives into meaningful sections. |
| providers | `_providers/` | App-level context setup — data fetching, auth, theming. Infrastructure, not UI. |
| features | `_features/` | Domain feature modules. Each owns `actions/`, `composables/`, and `ui/`. |
| lib | `_lib/` | Shared utilities, services, and factories consumed across features. |

**Dependency rule:** `_lib` → `_components` → `_widgets` → `_features` → routes. No layer imports from above itself. Features never import from other features.

Each layer exposes a barrel `index.ts`. Consumers always import from the barrel, never from deep internal paths.

## Transport Layer — Next.js Server Actions

Server actions act as the transport layer — thin entry points that call domain handlers and return a consistent `ActionResult<T>` shape. They are the equivalent of controllers in a traditional MVC stack.

### `createAction` — the action factory

All server actions are created via `createAction` (`_lib/factories/create-action.ts`), which provides:
- Optional session authentication via `protected: true`
- Consistent `ActionResult<T>` response shape via `_toSuccess` / `_toFailure` mappers
- Centralised error handling — `DomainException`, `ZodError`, and unexpected errors all flow to one catch boundary via `mapError`

```ts
// Unprotected — input validation is the handler's responsibility
const registerAction = createAction({
  handler: async (input: unknown) => {
    const dto = SchemaValidator.parse(registerUserSchema, input).getValueOrThrow();
    const result = await identityModule.registerUser.execute(dto);
    return result.getValueOrThrow();
  },
});

// Protected — session resolved and injected before handler runs
const getProfileAction = createAction({
  protected: true,
  handler: async (session: AuthUser, input: unknown) => {
    const result = await identityModule.getProfile.execute({ userId: session.id });
    return result.getValueOrThrow();
  },
});
```

### Full request flow

```
useMutation({ mutationFn: registerAction })     # composable (client)
  → registerAction(data)                         # server action — 'use server'
    → createAction — auth check (if protected)   # session resolved or throws
      → handler(input)                           # schema validation + domain call
        → identityModule.registerUser.execute()  # pure domain handler
          → src/core/                            # pure domain logic
    → ActionResult<T>                            # returned to client
  → onSuccess(result)                            # composable handles result
    → result.success → router.push('/dashboard')
    → !result.success → toast.error(result.message)
```

### Auth flow

```
loginAction(data)                      # server action
  → identityModule.loginUser.execute()
  → SessionService.set(jwt)            # httpOnly cookie
  → ActionResult<{ success: true }>

middleware.ts                          # Next.js middleware — runs at edge
  → reads 'session' cookie
  → JwtService.verify(token)
  → invalid/missing → redirect /login
  → valid → NextResponse.next()

createAction({ protected: true })      # protected server action
  → reads 'session' cookie
  → JwtService.verify(token)
  → injects AuthUser into handler
```

## Why not NestJS

NestJS was considered for its first-class DDD/CQRS support. The decision was made to keep the architecture framework-agnostic and avoid the overhead of decorator-based IoC for a project of this scale. The pragmatic DDD approach described above covers the same ground with significantly less ceremony.

## Validation

Validation occurs at two explicit boundaries, each with a distinct responsibility.

### 1. Transport boundary — `SchemaValidator`

`SchemaValidator` in the infrastructure layer wraps Zod's `safeParse` and returns a `Result<T, DomainException>`:

```ts
const dto = SchemaValidator.parse(registerUserSchema, input).getValueOrThrow();
```

This is the first gate — it validates that the raw incoming payload has the correct shape and types before it reaches the domain. `SchemaValidator.parse` accepts `unknown` input and infers the output type from the schema. A `ZodError` on failure flows through `mapError` to a consistent `VALIDATION_ERROR` response.

Swapping Zod means replacing `SchemaValidator` once. Server actions and the domain layer are untouched.

### 2. Domain boundary — value objects

Schema validation ensures the payload is structurally correct, but it does not enforce business rules. That is the responsibility of value objects in the domain layer:

```ts
// Email enforces valid format at construction time
const email = Email.create(cmd.email).getValueOrThrow(); // throws InvalidEmailException

// Password enforces strength rules
const password = Password.create(cmd.password).getValueOrThrow(); // throws InvalidPasswordException
```

Value objects validate domain invariants — rules that must always hold true regardless of where the data came from. If a value object fails, a typed `DomainException` is thrown and flows to the same catch boundary via `mapError`.

### Why two layers?

| | `SchemaValidator` | Value objects |
|---|---|---|
| Layer | Infrastructure | Domain |
| Validates | Shape and types | Business invariants |
| Fails with | `ZodError` → `VALIDATION_ERROR` | `DomainException` → `VALIDATION_ERROR` |
| Swappable | Yes — replace `SchemaValidator` | No — these are the rules |

Both map to the same `VALIDATION_ERROR` response externally. Internally they are distinct — schema validation is a transport concern, value object validation is a domain concern.

## `_lib/` structure

| Directory | Example | Responsibility |
|---|---|---|
| `_lib/factories/` | `createAction` | HOFs that produce typed, reusable wrappers |
| `_lib/services/` | `SessionService` | Stateful clients, external integrations |
| `_lib/utils/` | `cn` | Pure, stateless utility functions |
