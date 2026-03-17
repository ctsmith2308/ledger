# Architecture

This document covers the deliberate architectural decisions made in this project and the reasoning behind them. This project is an experiment and case study in pragmatic, framework-agnostic application architecture.

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

## Why tRPC instead of REST or Next.js Server Actions

### Server Actions

Server Actions were evaluated and not adopted for the following reasons:

- No structured middleware story — auth, logging, and error handling would need to be applied manually per action via wrapper functions.
- Tightly coupled to Next.js — porting to Nuxt/Vue, SvelteKit, or any other frontend framework would require rewriting every entry point.
- No end-to-end type safety between client and server beyond what manual TypeScript provides.

### tRPC

- Middleware (auth, logging, error sanitisation) is defined once in `src/trpc/procedure.ts` and applied to every procedure automatically — no per-route wiring.
- **Framework agnostic** — the entire `src/core/` layer and `src/trpc/` layer are portable. Swapping Next.js for SvelteKit or Nuxt requires only replacing the transport adapter, not the application logic.
- End-to-end type safety without code generation — renaming a procedure or changing its input shape produces an immediate TypeScript error at the call site, not a silent runtime failure.
- Zod schemas are defined once in the application layer and shared between client validation and server-side input parsing — no duplication.
- React Query is included via `@trpc/react-query`, giving caching, loading states, and optimistic updates for free.

### tRPC vs REST — practical comparison

| Concern | tRPC | REST |
|---|---|---|
| Type safety | End-to-end, automatic | Manual, error-prone |
| Middleware | Once, all procedures | Per route or custom wrapper |
| Client calls | `trpc.identity.register.useMutation()` | `fetch` + manual error handling |
| Schema sharing | Zod schema shared client/server | Duplicate or trust the wire |
| Refactoring | TS breaks call site immediately | Silent runtime failure |
| Framework portability | Adapter swap only | Full rewrite of entry points |
| External consumers | Awkward (dot notation, wire format) | Natural |

The only REST win is external consumers — third-party clients, mobile apps, or webhooks. Inbound webhooks (e.g. Plaid) use plain Next.js route handlers at `/api/webhooks/*` since the request format is controlled by the external service.

### URL convention

tRPC uses dot notation for procedure paths. When testing via Postman or similar tools, procedures are called as:

```
POST http://localhost:3000/api/trpc/identity.register
Content-Type: application/json

{"json": {"email": "test@test.com", "password": "Password1!"}}
```

The frontend never interacts with URLs directly — it uses the typed client (`trpc.identity.register.useMutation()`).

## Why not Express or Fastify

Next.js App Router provides API route handlers that cover all server-side concerns for this application — authentication, business logic, third-party integrations, and webhooks. Adding a separate Express or Fastify server would introduce a second process, a gateway or proxy to manage, and additional deployment complexity with no meaningful benefit at this scale.

If multi-platform support were required — serving a mobile app, a separate React Native client, or third-party integrations alongside the web app — a dedicated API server with a gateway would be the right call. At that point the `src/core/` and `src/trpc/` layers are already portable and a standalone server could be introduced without rewriting application logic.

## Why not NestJS

NestJS was considered for its first-class DDD/CQRS support. The decision was made to keep the architecture framework-agnostic and avoid the overhead of decorator-based IoC for a project of this scale. The pragmatic DDD approach described above covers the same ground with significantly less ceremony.

## Validation

Validation is decoupled from the transport layer via `IValidator<T>`:

```ts
interface IValidator<T> {
  parse(data: unknown): T;
}
```

`ZodValidator<T>` implements this interface in the infrastructure layer. tRPC's `.input()` accepts any object with a `parse` method, so validators plug in directly with no adapter:

```ts
.input(registerUserValidator)
```

Swapping Zod for another library means implementing `IValidator<T>` once. The tRPC procedures and application layer are untouched.
