# Ledger

> **License:** This code is published for portfolio review and educational reference only. See [LICENSE](./LICENSE) for terms.

A portfolio project built to production-grade standards. Not to compete with Mint, but to demonstrate how I think about systems. The feature set is a vehicle. The architectural decisions are the point.

-> **[Architecture decisions & reasoning](./docs/architecture.md)**: DDD-lite, CQRS command bus, modular monolith, server actions transport, Feature-Sliced Design, MFA, feature flags, observability, and the experiments that didn't make it (NestJS boilerplate, tRPC bridge, Fastify gateway).

---

| | |
|---|---|
| **Live demo** | [ledger-production.up.railway.app](https://ledger-production.up.railway.app/) |
| **Architecture doc** | [docs/architecture.md](./docs/architecture.md) |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict, no `any`)
- **Transport:** Next.js Server Actions via next-safe-action
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL 16 via Prisma ORM
- **Cache / Rate Limiting:** Upstash Redis
- **Observability:** OpenTelemetry + Grafana Cloud (traces)
- **Testing:** Vitest (unit + integration)
- **Client State:** TanStack Query + TanStack Form
- **Auth:** jose (JWT signing/verification), otpauth + qrcode (TOTP MFA)

## Prerequisites

- Node.js 20+
- Docker + Docker Desktop

## Getting Started

### 1. Install dependencies

```bash
npm install
```

> `npm install` also runs `prisma generate` via the `postinstall` script. If the Prisma client ever falls out of sync with the schema, run `npm run prisma:generate` manually.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret used to sign and verify JWT tokens. Must be a long, random string |
| `DATABASE_URL` | Postgres connection string. Must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` below |
| `POSTGRES_USER` | Postgres username used by Docker Compose |
| `POSTGRES_PASSWORD` | Postgres password used by Docker Compose |
| `POSTGRES_DB` | Postgres database name (default: `ledger`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (feature flag cache, rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `QSTASH_URL` | QStash URL for async event processing |
| `QSTASH_TOKEN` | QStash authentication token |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash webhook signature verification (current key) |
| `QSTASH_NEXT_SIGNING_KEY` | QStash webhook signature verification (next rotation key) |
| `APP_URL` | Application base URL (default: `http://localhost:3000`) |
| `PLAID_CLIENT_ID` | Plaid sandbox client ID |
| `PLAID_SECRET` | Plaid sandbox secret |
| `PLAID_ENV` | Plaid environment (`sandbox`, `development`, or `production`) |
| `SESSION_DURATION_SECONDS` | Session expiry duration in seconds |
| `GRAFANA_TOKEN` | Grafana Cloud API token (optional, for traces) |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Grafana Cloud OTLP endpoint (optional, for traces) |
| `OTEL_EXPORTER_OTLP_HEADERS` | Grafana Cloud auth header (optional, for traces) |
| `CRON_SECRET` | Shared secret for authenticating cron job requests |
| `TRIAL_TTL_HOURS` | Hours before trial accounts expire (default: `48`) |

Each collaborator runs their own local Docker container and database. There is no shared development database. Copy `.env.example`, fill in your own values, and Docker Compose will provision the database from them.

> **`.env.example` is documentation only.** Neither Prisma nor Docker Compose read from it directly. Prisma reads `DATABASE_URL` from `.env`, and Docker Compose reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `.env`. The example file exists solely to show collaborators what variables are required.

> **Important:** Only `.env.example` and `.env.test.example` are safe to commit. They contain no secrets and serve as the reference for collaborators. All other env files (`.env`, `.env.test`) are gitignored and must never be committed. A preflight check enforces this on every push and pull request.

### 3. Start infrastructure

Docker must be running before migrations or the dev server. PostgreSQL must be healthy before Prisma can connect.

```bash
docker compose up postgres -d
```

> Redis is provided by Upstash (remote). No local Redis container is needed.

### 4. Run migrations and seed

Migrations require the database to be running. The Prisma client is generated automatically after `npm install` but must be regenerated any time the schema changes.

```bash
npm run prisma:migrate
npm run prisma:seed
npm run prisma:seed:demo
```

> If you update `prisma/schema.prisma`, always run `npm run prisma:generate` followed by `npm run prisma:migrate` to keep the client and database in sync.

### 5. Start the dev server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint and auto-fix TypeScript files |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:cov` | Run unit tests with coverage |
| `npm run test:int` | Run integration tests against test DB |
| `npm run test:int:watch` | Run integration tests in watch mode |
| `npm run test:int:setup` | Spin up test DB container and run migrations |
| `npm run prisma:migrate` | Run migrations (local) |
| `npm run prisma:migrate:test` | Run migrations against test DB |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed users, budgets, and feature flags |
| `npm run prisma:seed:demo` | Seed Plaid sandbox data |
| `npm run prisma:reset` | Reset database and run migrations |
| `npm run prisma:reset:full` | Reset + migrate + seed demo |
| `npm run prisma:migrate:deploy` | Deploy migrations (non-interactive, for CI/CD) |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Run Playwright e2e tests with UI |

## Docker

Run the full stack (app + postgres):

```bash
docker compose up --build
```

Run only infrastructure (for local Next.js dev):

```bash
docker compose up postgres -d
```

Stop and remove containers:

```bash
docker compose down --remove-orphans
```

## Prisma Gotchas

- **Order matters.** Docker must be running and PostgreSQL healthy before running any Prisma command. Running `prisma migrate` against a stopped database will fail with a connection error.
- **Client generation.** The Prisma client is generated from the schema at `prisma/schema.prisma`. It is not committed to source control. Any time the schema changes, run `npm run prisma:generate` to regenerate it. This happens automatically on `npm install` via the `postinstall` script.
- **Migration vs generate.** `prisma migrate dev` applies schema changes to the database and regenerates the client. `prisma generate` only regenerates the client without touching the database. If the schema and database are out of sync, always migrate first.
- **Test database.** Integration tests run against a separate database to prevent leaking test data into local development. Configure `.env.test` from `.env.test.example` and run `npm run test:int:setup` before the first integration test run.
- **Generated client location.** The client is generated into `node_modules/@prisma/client`. If you see type errors related to Prisma models after a schema change, regenerate the client.

## Testing

### Unit tests

```bash
npm run test
```

### Integration tests

Integration tests require a separate test database. Configure `.env.test` using `.env.test.example` as a reference:

```bash
cp .env.test.example .env.test
```

Fill in your local test database credentials in `.env.test`.

Set up the test database container and run migrations in one step:

```bash
npm run test:int:setup
```

Then run tests:

```bash
npm run test:int
```

> `.env.test` is gitignored. Never use production credentials in test configuration.

## Architecture

The full written record of every decision and experiment lives in **[docs/architecture.md](./docs/architecture.md)**. It covers:

- **CQRS with typed command and query buses.** Phantom types, Module composition roots, return type inference without explicit generics
- **Modular monolith.** Domain boundaries enforced at the module level (identity, banking, transactions, budgets), no premature service extraction
- **Domain-Driven Design (lite).** Aggregates, value objects, domain events, repository interfaces, and Postgres-backed event persistence with QStash async processing
- **Feature-Sliced Design (lite).** One-way dependency rules without the full FSD specification overhead
- **Server actions via next-safe-action.** `actionClient` with `.use()` middleware chaining, single catch boundary via `handleServerError`, consistent error shape
- **TOTP-based MFA.** Two-step login flow with type-based JWT signing (`JWT_TYPE.ACCESS`, `JWT_TYPE.MFA_CHALLENGE`)
- **Feature flags.** Prisma table with Upstash Redis cache layer, middleware-level gating via `withFeatureFlag`
- **Observability.** OpenTelemetry traces to Grafana Cloud, domain events as the audit layer
- **Experiments that didn't make it.** NestJS CQRS boilerplate, tRPC bridge, Fastify gateway, and the honest accounting of each

## Project Structure

```
src/
  core/
    modules/
      identity/
        domain/              # aggregates, value objects, events, repository interfaces
        application/         # commands, queries, handlers
        infrastructure/      # repositories (.impl.ts), mappers, services
        api/                 # composition root, service, DTOs, mappers
      banking/               # same structure
      transactions/          # same structure
      budgets/               # same structure
    shared/
      domain/
        bus/                 # Command, Query base classes, IEventBus interface
        constants/           # FEATURE_KEYS, USER_TIERS, JWT_TYPE, ERROR_CODES, event types
        exceptions/          # typed domain exceptions
        repositories/        # IFeatureFlagRepository
        services/            # IJwtService, IObservabilityService, IIdGenerator, IFeatureFlagCacheService
      infrastructure/
        bus/                 # CommandBus, QueryBus, EventBus, InProcessEventBus
        cache/               # UpstashFeatureFlagCache
        persistence/         # PrismaService, prisma singleton
        repositories/        # FeatureFlagRepository
        services/            # JwtService, IdGenerator, ObservabilityService
        utils/               # toErrorResponse, logger
  tests/                     # Playwright e2e tests
  proxy.ts                   # JWT verification, protects dashboard routes
  instrumentation.ts         # OpenTelemetry SDK init

  app/
    _shared/
      lib/
        next-safe-action/    # actionClient, handleActionResponse, middleware
        session/             # getCookie, setCookie, deleteCookie, loadSession
        query/               # queryKeys, getQueryClient
        rate-limit/          # Upstash rate limiter
        formatters/          # format-category
        tailwind/            # cn utility
      routes/              # ROUTES constant
      content/             # architecture decisions, case studies (portfolio content)
    _entities/               # data access layer by domain
    _features/               # feature modules (hooks, UI, schemas)
    _widgets/                # compositional UI blocks that assemble features into page sections
    _components/             # primitive UI (buttons, forms, surfaces)
    _providers/              # ThemeProvider, QueryProvider
    (public)/                # landing page, architecture, case studies
    (auth)/                  # login, register, MFA
    (dashboard)/             # overview, transactions, budgets, accounts, spending-habits
    (account)/               # settings
    api/                     # route handlers

prisma/                      # schema, migrations, seed scripts
```

Each core module follows the same layered structure. The `api/` directory within each module serves as the composition root. It wires dependencies, registers handlers on the command/query buses, and exposes the module's service (e.g., `IdentityService`, `BudgetsService`). No DI containers. Wiring is explicit via Module classes with static factories.

On the frontend, `_entities/` owns server actions and data access, `_features/` composes entity actions into hooks with TanStack Query, and pages are thin entry points that import from features and components. Dependency flow is one-way: `_shared/lib/` <- `_entities/` <- `_features/` <- pages.
