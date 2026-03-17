# Ledger

A personal finance management app built with Next.js, Prisma, PostgreSQL, and Redis.

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **API Layer** — tRPC v11
- **Styling** — Tailwind CSS v4
- **Database** — PostgreSQL 16 via Prisma ORM
- **Cache** — Redis 7
- **Testing** — Vitest

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
| `DATABASE_URL` | Postgres connection string — must match `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` below |
| `POSTGRES_USER` | Postgres username used by Docker Compose |
| `POSTGRES_PASSWORD` | Postgres password used by Docker Compose |
| `POSTGRES_DB` | Postgres database name (default: `ledger`) |

Each collaborator runs their own local Docker container and database — there is no shared development database. Copy `.env.example`, fill in your own values, and Docker Compose will provision the database from them.

> **`.env.example` is documentation only** — neither Prisma nor Docker Compose read from it directly. Prisma reads `DATABASE_URL` from `.env`, and Docker Compose reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `.env`. The example file exists solely to show collaborators what variables are required.

> **Important:** Only `.env.example` and `.env.test.example` are safe to commit — they contain no secrets and serve as the reference for collaborators. All other env files (`.env`, `.env.test`) are gitignored and must never be committed. A preflight check enforces this on every push and pull request.

### 3. Start infrastructure

Docker must be running before migrations or the dev server. PostgreSQL must be healthy before Prisma can connect.

```bash
docker compose up postgres redis -d
```

### 4. Run migrations

Migrations require the database to be running. The Prisma client is generated automatically after `npm install` but must be regenerated any time the schema changes.

```bash
npm run prisma:migrate
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
| `npm run prisma:migrate` | Run migrations (local) |
| `npm run prisma:migrate:test` | Run migrations against test DB |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:studio` | Open Prisma Studio |

## Docker

Run the full stack (app + postgres + redis):

```bash
docker compose up --build
```

Run only infrastructure (for local Next.js dev):

```bash
docker compose up postgres redis -d
```

Stop and remove containers:

```bash
docker compose down --remove-orphans
```

## Prisma Gotchas

- **Order matters** — Docker must be running and PostgreSQL healthy before running any Prisma command. Running `prisma migrate` against a stopped database will fail with a connection error.
- **Client generation** — The Prisma client is generated from the schema at `prisma/schema.prisma`. It is not committed to source control. Any time the schema changes, run `npm run prisma:generate` to regenerate it. This happens automatically on `npm install` via the `postinstall` script.
- **Migration vs generate** — `prisma migrate dev` applies schema changes to the database and regenerates the client. `prisma generate` only regenerates the client without touching the database. If the schema and database are out of sync, always migrate first.
- **Test database** — Integration tests run against a separate database on port `5433` to prevent leaking test data into local development. Configure `.env.test` from `.env.test.example` and run `npm run prisma:migrate:test` before the first integration test run.
- **Generated client location** — The client is generated into `node_modules/@prisma/client`. If you see type errors related to Prisma models after a schema change, regenerate the client.

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

The test database runs on port `5433` (separate from the local dev database on `5432`). Start the test database container, run migrations, then run tests:

```bash
docker compose up postgres redis -d
npm run prisma:migrate:test
npm run test:int
```

> `.env.test` is gitignored. Never use production credentials in test configuration.

## Architecture

For architectural decisions and reasoning — tRPC over REST, DDD-lite, explicit dependency wiring, validation abstraction, and more — see [docs/architecture.md](./docs/architecture.md).

## Project Structure

```
src/
  app/
    (auth)/         # Login, register, MFA routes
    (dashboard)/    # Budgets, transactions, settings routes
  core/
    modules/        # Feature modules (identity, ledger, etc.)
    shared/         # Domain primitives, infrastructure utilities
  trpc/
    routers/        # Procedure definitions per module
    mappers/        # Error mapping
    client/         # React client and provider
  components/       # Shared UI components
  assets/           # Global styles
prisma/             # Schema and migrations
```
