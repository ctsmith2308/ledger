# Ledger

A personal finance management app built with Next.js, Prisma, PostgreSQL, and Redis.

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
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

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `POSTGRES_USER` | Postgres username (Docker) |
| `POSTGRES_PASSWORD` | Postgres password (Docker) |
| `POSTGRES_DB` | Postgres database name (Docker) |

> **Important:** Only `.env.example` and `.env.test.example` are safe to commit — they contain no secrets and serve as the reference for collaborators. All other env files (`.env`, `.env.local`, `.env.test`) are gitignored and must never be committed. A preflight check enforces this on every push and pull request.

### 3. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 4. Run migrations

```bash
npm run prisma:migrate
```

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
| `npm run prisma:generate` | Generate Prisma client |
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

Then run migrations and tests against the test DB:

```bash
npm run prisma:migrate:test
npm run test:int
```

> `.env.test` is gitignored. Never use production credentials in test configuration.

## Project Structure

```
src/
  app/
    (auth)/         # Login, register, MFA routes
    (dashboard)/    # Budgets, transactions, settings routes
  features/         # Feature modules (auth, etc.)
  components/       # Shared UI components
  assets/           # Global styles
prisma/             # Schema and migrations
```
