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
const hasher = new ArgonPasswordHasher();
const idGenerator = new UuIdV4IdGenerator();

const identityModule = {
  registerUser: new RegisterUserHandler(repo, hasher, idGenerator),
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

## Transport Layer — Next.js Server Actions

Server actions act as the transport layer — thin entry points that validate input, call domain handlers, and return a consistent `ActionResult<T>` shape. They are the equivalent of controllers in a traditional MVC stack.

### `withAction` — the action wrapper

All server actions are wrapped with `withAction` which provides:
- Optional Zod schema validation via `schema.parse()` — throws `ZodError` on failure
- Consistent `ActionResult<T>` response shape
- Centralised error handling via `mapError` — `ZodError`, `DomainException`, and unexpected errors all map to the same failure shape

```ts
// with validation
const registerAction = withAction(async (input) => {
  const result = await identityModule.registerUser.execute(input);
  return result.getValueOrThrow();
}, registerUserSchema);

// without validation — sign out, toggles
const signOutAction = withAction(async () => {
  // side effect only
});
```

### `withAuth` — protected actions

Protected actions compose with `withAuth`, which reads and verifies the JWT session cookie before executing the handler. The verified user is injected into the handler:

```ts
const getProfileAction = withAuth(async (input, user) => {
  return identityModule.getProfile.execute({ userId: user.id });
}, schema);
```

### Full request flow

```
useMutation({ mutationFn: registerAction })   # composable (client)
  → registerAction(data)                       # server action — 'use server'
    → withAction — schema.parse(data)          # validates input
      → identityModule.registerUser.execute()  # domain handler
        → src/core/                            # pure domain logic
    → ActionResult<T>                          # returned to client
  → onSuccess(result)                          # composable handles result
    → result.success → router.push('/login')
    → !result.success → toast.error(result.message)
```

### Auth flow

```
loginAction(data)                    # server action
  → identityModule.loginUser.execute()
  → cookies().set('session', jwt)    # httpOnly cookie
  → ActionResult<{ success: true }>

middleware.ts                        # Next.js middleware — runs at edge
  → reads 'session' cookie
  → jwtVerify(token, secret)
  → invalid/missing → redirect /login
  → valid → NextResponse.next()

withAuth(handler)                    # protected server action
  → reads 'session' cookie
  → jwtVerify(token, secret)
  → injects user into handler
```

## Why not NestJS

NestJS was considered for its first-class DDD/CQRS support. The decision was made to keep the architecture framework-agnostic and avoid the overhead of decorator-based IoC for a project of this scale. The pragmatic DDD approach described above covers the same ground with significantly less ceremony.

## Validation

Validation is decoupled from the transport layer via `IValidator<T>`:

```ts
interface IValidator<T> {
  parse(data: unknown): T;
}
```

`ZodValidator<T>` implements this interface in the infrastructure layer. `withAction` accepts any Zod schema directly — `schema.parse()` throws a `ZodError` on failure which flows through `mapError` to a consistent `VALIDATION_ERROR` response.

Swapping Zod for another library means implementing `IValidator<T>` once. Server actions and the domain layer are untouched.

## `_lib/utils/` vs `_lib/services/`

| | `_lib/utils/` | `_lib/services/` |
|---|---|---|
| Example | `cn`, `withAction`, `withAuth` | monitoring SDKs, external clients |
| Side effects | None | Yes — network, logging, notifications |
| Stateful | No | Yes — config, connections |
