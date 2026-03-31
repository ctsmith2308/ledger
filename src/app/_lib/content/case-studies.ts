type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  sections: CaseStudySection[];
};

type CaseStudySection = {
  heading: string;
  body: string;
  table?: { headers: string[]; rows: string[][] };
  code?: { label: string; code: string };
};

const caseStudies: CaseStudy[] = [
  {
    slug: 'trpc-vs-server-actions',
    title: 'tRPC vs Next.js server actions',
    subtitle:
      'Why the project moved from tRPC to server actions, and what that decision actually cost.',
    badge: 'Migration',
    summary:
      'Ledger started with tRPC as the API layer — end-to-end type safety, a clean procedure model, and genuine framework portability. The switch to Next.js server actions via next-safe-action was a deliberate tradeoff: less portability, a mature middleware model, and TanStack Query for server state caching.',
    sections: [
      {
        heading: 'Why tRPC first',
        body: 'tRPC gives you end-to-end type safety without a code generator, a clean middleware model in `procedure.ts`, and adapters for every major framework. The portability argument was real — swap the route handler, keep everything else. The full stack could move to SvelteKit or Nuxt with surface-level changes only.',
        table: {
          headers: ['Concern', 'tRPC', 'next-safe-action + TanStack Query'],
          rows: [
            ['API layer', 'tRPC — adapter swap to port', 'Next.js server actions (POST only)'],
            [
              'Auth',
              'httpOnly cookie via tRPC context',
              '.use(withAuth) middleware chain',
            ],
            [
              'Server state',
              'TanStack Query via tRPC hooks',
              'TanStack Query — server hydrates cache, client reads',
            ],
            [
              'Type safety',
              'End-to-end via tRPC, no code generation',
              'Typed server action responses + Zod input schemas',
            ],
            [
              'Middleware',
              'Once in procedure.ts, applied everywhere',
              '.use() chaining — withAuth, withFeatureFlag, withRateLimit',
            ],
            [
              'Bundle',
              'tRPC client + TanStack Query',
              'TanStack Query only (server actions have no client bundle)',
            ],
          ],
        },
      },
      {
        heading: 'The tipping point',
        body: 'The tipping point was not a technical failure of tRPC — it was a scope question. This is a portfolio project, not a product targeting multiple frameworks. The portability argument is compelling in theory, but there is no SvelteKit migration on the roadmap. Carrying the tRPC mental model and the adapter wiring for a benefit that would never be realised was ceremony without payoff. next-safe-action with .use() chaining provides the same middleware model — auth, rate limiting, feature flags — with Zod schema validation and a typed error boundary.',
      },
      {
        heading: 'What next-safe-action provides',
        body: 'next-safe-action provides the same middleware chaining model tRPC had. Each server action chains .use(withAuth).use(withFeatureFlag).inputSchema(schema) — composable, type-safe, and consistent. handleServerError is the single catch boundary that maps domain exceptions to client-facing error responses. The execute() utility bridges the serialisation gap to TanStack Query.',
        code: {
          label: 'next-safe-action vs tRPC procedure — equivalent patterns',
          code: `// tRPC — middleware chain
const protectedProcedure = publicProcedure.use(authMiddleware);
const loginRouter = router({ login: publicProcedure.mutation(...) });

// next-safe-action — .use() chaining
const createBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsController.createBudget(ctx.userId, parsedInput.category, parsedInput.monthlyLimit);
  });`,
        },
      },
      {
        heading: 'What was genuinely lost',
        body: 'Framework portability is the real loss. If the project ever needs to run outside of Next.js, the transport layer is now coupled to the framework. The domain core (`src/core/`) remains portable — it has zero Next.js dependencies. But the action layer would need to be rewritten, not just re-adapted. For a portfolio project, this is an acceptable tradeoff. For a product with an uncertain frontend future, it would not be.',
      },
    ],
  },
  {
    slug: 'nestjs-overhead',
    title: 'NestJS — the overhead audit',
    subtitle:
      'The project ran through a NestJS phase. The wins were real but narrow. The overhead was not.',
    badge: 'Architecture',
    summary:
      'NestJS has genuine strengths: a module system, first-class decorators, and a clear opinion on application structure. The question was whether those strengths justified the weight they came with. For this project, the honest answer was no.',
    sections: [
      {
        heading: 'What NestJS brought',
        body: 'NestJS provides a structured module system, a built-in DI container, and a decorator-driven model that maps cleanly onto familiar patterns from Angular and Spring. The opinions are well-considered and the ecosystem is mature. For teams onboarding developers at scale, the conventions are a genuine asset — everyone lands in the same place.',
      },
      {
        heading: 'Where the overhead accumulated',
        body: 'The DI container was the main cost. Every dependency had to be registered, decorated, and resolved through the framework machinery. Adding a new service meant touching the module definition, the provider list, and the injection tokens — three files for what should be a one-line constructor argument. The decorator surface area grew fast, and the mental model required to reason about instantiation order was non-trivial.',
        table: {
          headers: ['Concern', 'NestJS', 'Static factories + closures'],
          rows: [
            [
              'Dependency wiring',
              'DI container, decorators, modules',
              'Explicit constructor arguments',
            ],
            [
              'New service cost',
              'Provider registration + module update',
              'Add parameter, done',
            ],
            [
              'Testability',
              'TestingModule setup per test',
              'Pass mock directly',
            ],
            [
              'Framework coupling',
              'Deep — decorators throughout',
              'None in domain/application layers',
            ],
            [
              'Onboarding overhead',
              'High — container mental model required',
              'Low — plain TypeScript',
            ],
          ],
        },
      },
      {
        heading: 'The wins were real but narrow',
        body: 'The structured module system did enforce boundaries. The decorator-based guard and middleware model was consistent. For a large team working on a long-lived service, those rails are worth paying for. For a single-developer portfolio project with explicit DDD boundaries already enforced by convention, the container added indirection without adding value.',
      },
      {
        heading: 'What replaced it',
        body: 'Static factory functions and manual constructor injection. Each module exposes a factory that wires its own dependencies explicitly. The result is plain TypeScript: no decorators, no container, no registration step. Dependencies are visible at the call site, testable by passing a mock directly, and trivially traceable through a standard IDE.',
        code: {
          label: 'NestJS provider vs static factory — equivalent wiring',
          code: `// NestJS — container registration
@Module({
  providers: [UserRepository, PasswordHasher, RegisterUserHandler],
  exports: [RegisterUserHandler],
})
export class IdentityModule {}

// Static factory — explicit wiring
const identityModule = {
  registerUser: RegisterUserHandler.create({
    userRepository: UserRepository.create(prisma),
    hasher: BcryptHasher.create(),
    idGenerator: CuidGenerator,
  }),
};`,
        },
      },
      {
        heading: 'The verdict',
        body: 'NestJS is not the wrong tool — it is the right tool for a different context. The overhead is justified when the team size and service complexity are high enough that conventions and the container pay for themselves. This project is not that context. Manual wiring is clearer, faster to navigate, and has zero framework coupling in the layers that matter.',
      },
    ],
  },
  {
    slug: 'nuxt-to-nextjs',
    title: 'Nuxt → Next.js migration',
    subtitle:
      'The project started in Nuxt 3. Here is what moved, what did not, and why the switch happened.',
    badge: 'Migration',
    summary:
      'The initial version of Ledger was built in Nuxt 3 with a Vue frontend. The migration to Next.js was driven by ecosystem fit, not framework quality. Nuxt 3 is excellent — the decision was about where the hiring market and the portfolio narrative pointed.',
    sections: [
      {
        heading: 'Why Nuxt first',
        body: 'Nuxt 3 has a compelling server-side story — server routes, auto-imports, and a clean composable model via `useAsyncData` and `useFetch`. The Vue ecosystem is mature and the DX is genuinely good. The original architecture (DDD core, explicit dependency wiring, Result types) transferred cleanly because `src/core/` was already framework-agnostic.',
      },
      {
        heading: 'The tipping point',
        body: 'Two factors drove the switch. First, the majority of senior full-stack roles in the target market specify React and Next.js — a Nuxt portfolio project is a conversation stopper before the architecture even gets discussed. Second, the React ecosystem (TanStack Query, TanStack Form, shadcn/ui) had better tooling for the specific patterns this project wanted to demonstrate. The decision was pragmatic, not a quality judgement on Nuxt.',
      },
      {
        heading: 'What moved cleanly',
        body: 'Everything in `src/core/` — domain logic, application handlers, infrastructure adapters, repository interfaces — moved without modification. The domain layer had zero framework dependencies. This was the architectural bet that paid off: keeping the domain pure meant the transport layer was the only thing that changed.',
      },
      {
        heading: 'What had to be rewritten',
        body: 'The entire transport and UI layer was a rewrite. Nuxt server routes became Next.js server actions. Vue composables became React hooks with TanStack Form. The Pinia stores became TanStack Query. The Nuxt auto-import conventions became explicit barrel imports. None of this was surprising — it was the expected cost of a framework migration.',
      },
      {
        heading: 'The validation',
        body: 'The migration proved the architectural premise. src/core/ — domain logic, application handlers, repository interfaces — moved without a single modification. Zero Next.js dependencies in the domain layer meant the transport swap was surgical. That outcome was not accidental. It was the result of enforcing the dependency rule from day one.',
      },
    ],
  },
  {
    slug: 'domain-event-ownership',
    title: 'Domain event ownership — aggregate vs handler',
    subtitle:
      'Not every event belongs to an aggregate. Recognising the difference kept the domain honest.',
    badge: 'Architecture',
    summary:
      'Ledger uses a durable event-driven architecture — events are persisted for audit, cross-module communication, and failure replay, but aggregates are reconstituted from database snapshots, not event streams. That distinction created a question: if events are not the source of truth for state, does every event still need to flow through an aggregate? The answer was no, and formalising that boundary prevented a category of modelling mistakes.',
    sections: [
      {
        heading: 'The orthodox position',
        body: "In event-sourced systems, the aggregate is the sole source of events because the event stream is the state. Every fact about the system must originate from an aggregate method — the aggregate decided it happened, so the aggregate records it. Daniel Whittaker's CQRS walkthrough articulates this clearly: the command handler loads the aggregate, the aggregate executes the behavior and raises events, the handler persists them. No exceptions.",
      },
      {
        heading: 'Where orthodoxy broke down',
        body: 'Ledger is not event-sourced. Events are persisted to a `domain_events` table via a DurableEventBus, but aggregate state lives in Postgres and is rebuilt via `reconstitute()`, not by replaying events. This means events serve audit and integration — they are not the authoritative state record. Forcing every event through an aggregate created three modelling problems that the orthodox model does not account for.',
        table: {
          headers: ['Event', 'Problem with aggregate ownership'],
          rows: [
            [
              'LoginFailedEvent',
              'No aggregate exists — the user was not found or the password was wrong. There is nothing to call addDomainEvent() on.',
            ],
            [
              'AccountDeletedEvent',
              'The aggregate is being destroyed. Having a deleted aggregate raise its own death notice is a lifecycle contradiction.',
            ],
            [
              'UserLoggedInEvent',
              'UserSession.create() was raising this event, but login is a use-case coordination — a session does not know why it was created. It could be a login, a token refresh, or an admin impersonation.',
            ],
          ],
        },
      },
      {
        heading: 'The two-pattern model',
        body: "The resolution was to formalise two event ownership patterns based on a single question: does this event describe the aggregate's own state change? If yes, the aggregate raises it via `addDomainEvent()`. If no — the event spans aggregates, has no owning aggregate, or the aggregate is being destroyed — the handler dispatches it directly via `eventBus.dispatch()`. Both paths flow through the same DurableEventBus and land in the same `domain_events` table.",
        table: {
          headers: ['Event', 'Owner', 'Pattern'],
          rows: [
            ['UserRegisteredEvent', 'User.register()', 'Aggregate-raised'],
            [
              'UserProfileUpdatedEvent',
              'UserProfile.updateName()',
              'Aggregate-raised',
            ],
            ['UserLoggedInEvent', 'LoginUserHandler', 'Handler-dispatched'],
            ['LoginFailedEvent', 'LoginUserHandler', 'Handler-dispatched'],
            ['UserLoggedOutEvent', 'LogoutUserHandler', 'Handler-dispatched'],
            [
              'AccountDeletedEvent',
              'DeleteAccountHandler',
              'Handler-dispatched',
            ],
          ],
        },
      },
      {
        heading: 'Why not full event sourcing',
        body: 'Full event sourcing would resolve the ownership question by requiring every event to flow through an aggregate — but it also requires aggregate reconstitution from event replay, a message broker for reliable delivery and projection rebuilds, and snapshot strategies for long-lived aggregates. The infrastructure cost is significant and not justified at this scale. The current architecture — durable event persistence with database-backed aggregate state — provides the audit trail and cross-module decoupling benefits without the operational overhead. The IEventBus interface preserves the upgrade path if the system grows into it.',
      },
    ],
  },
  {
    slug: 'observability-grafana-vs-newrelic',
    title:
      'Grafana Cloud over New Relic — open standards over proprietary agents',
    subtitle:
      'Having used New Relic on frontend apps, the choice to go with Grafana was deliberate, not unfamiliar.',
    badge: 'Infrastructure',
    summary:
      'This project instruments with OpenTelemetry and exports to Grafana Cloud. New Relic was a real option — I have production experience with their browser monitoring agent for frontend log capture and performance tracking. The decision was about vendor independence, not capability gaps.',
    sections: [
      {
        heading: 'New Relic experience',
        body: "I have hands-on experience integrating New Relic's browser monitoring agent into frontend applications — manually capturing browser logs, tracking page load performance, and correlating frontend errors with backend traces. New Relic's browser SDK (`@newrelic/browser-agent`) provides real user monitoring (RUM), error tracking, and session replay out of the box. The DX is good. The data is rich. The dashboards are polished.",
      },
      {
        heading: 'Why not New Relic here',
        body: "New Relic's strength is its all-in-one platform — install the agent, everything lights up. But that convenience comes with coupling. The `@newrelic/next` agent instruments Next.js with New Relic-specific APIs. Your error capture, span creation, and log forwarding use New Relic's SDK, not an open standard. Switching to a different backend means rewriting instrumentation, not changing an endpoint.",
        table: {
          headers: ['Concern', 'New Relic', 'OpenTelemetry + Grafana'],
          rows: [
            [
              'Instrumentation',
              '@newrelic/next agent — proprietary SDK',
              '@opentelemetry/sdk-node — open standard',
            ],
            [
              'Vendor lock-in',
              'High — New Relic APIs throughout codebase',
              'None — zero vendor imports in application code',
            ],
            [
              'Backend swap',
              'Rewrite instrumentation',
              'Change OTLP endpoint env var',
            ],
            [
              'Free tier',
              '100GB/month with retention limits',
              '50GB traces, 50GB logs, 10k metrics',
            ],
            [
              'Browser monitoring',
              'Built-in RUM, session replay, log capture',
              'Separate concern — Grafana Faro or keep New Relic for frontend',
            ],
            [
              'Setup complexity',
              'Lower — one agent, auto-instrumentation',
              'Higher — SDK init, sampler config, manual span enrichment',
            ],
          ],
        },
      },
      {
        heading: 'The architectural argument',
        body: 'The application code has zero Grafana imports. The IObservabilityService interface calls trace.getActiveSpan() from the OpenTelemetry API — a vendor-neutral package. The buses create spans via a tracer from the same API. The OTLP exporter reads the endpoint from environment variables. Grafana is a deployment decision, not a code decision. Switching to Datadog, Honeycomb, Jaeger, or back to New Relic is an env var change — not a refactor.',
      },
      {
        heading: 'Where New Relic still wins',
        body: "Browser monitoring. OpenTelemetry's frontend story is immature compared to New Relic's browser agent. For a full-stack observability picture — correlating frontend errors with backend traces, capturing user sessions, tracking Core Web Vitals — New Relic's browser SDK or Grafana Faro would complement the backend OpenTelemetry instrumentation. The backend chose open standards. The frontend can choose the best tool for the job independently.",
      },
    ],
  },
  {
    slug: 'tanstack-query-safe-action',
    title: 'TanStack Query + next-safe-action — server state without the Redux tax',
    subtitle:
      'The server owns the data. The client caches it. Mutations invalidate. No store, no reducers, no sync.',
    badge: 'State Management',
    summary:
      'Ledger manages server state with TanStack Query and mutations with next-safe-action. Redux Toolkit Query, Nanostores, and React\'s native action hooks were all evaluated. The decision came down to what the application actually needs versus what each tool is optimised for.',
    sections: [
      {
        heading: 'The problem',
        body: 'Server-rendered pages fetch data on the server. Client components need access to that data — session, budget overview, spending breakdowns — without refetching. Mutations need to update the UI without a full page re-render. The gap between "server fetched the data" and "client component needs it" is the core state management problem.',
      },
      {
        heading: 'Why TanStack Query',
        body: 'TanStack Query solves server state caching. The server fetches data, hydrates the QueryClient, and client components read from the cache via useQuery. Mutations call server actions via useMutation, then invalidateQueries triggers a background refetch — the UI updates without router.refresh(). The cache is the single source of truth for server data on the client. No manual sync, no store mirroring, no stale state bugs.',
      },
      {
        heading: 'What was eliminated',
        body: 'Several alternatives were considered and rejected for specific reasons. The decision was not about capability but about fit.',
        table: {
          headers: ['Tool', 'What it does', 'Why not'],
          rows: [
            [
              'RTK Query',
              'Server state cache built on Redux',
              'Bundles Redux as a dependency for a problem that doesn\'t exist here. No complex cross-cutting client state justifies the Redux machinery.',
            ],
            [
              'Nanostores',
              'Atom-based client state (~1kb)',
              'Right tool if cross-feature client state arises. It hasn\'t. TanStack Query handles server state; local component state handles the rest.',
            ],
            [
              'useActionState (React)',
              'Form state with loading/error',
              'Coupled to form submissions. No caching, no retry, no global error handling. Solves a narrower problem.',
            ],
            [
              'useOptimisticAction',
              'Optimistic UI updates',
              'Useful for latency-sensitive mutations. Not needed when server round-trips are fast and the cache invalidation model is sufficient.',
            ],
            [
              'Direct server action calls',
              'Simple call, no loading UI',
              'Works for fire-and-forget mutations. No loading states, no error boundaries, no cache coordination.',
            ],
          ],
        },
      },
      {
        heading: 'next-safe-action for mutations',
        body: 'Server actions are POST requests. next-safe-action wraps them with middleware chaining (.use(withAuth).use(withFeatureFlag)), input schema validation (.inputSchema()), and a typed error boundary (handleServerError). The execute() utility bridges the serialisation gap — it unwraps the safe-action response and throws ActionError on failure, which TanStack Query catches via the global MutationCache onError handler. One toast, one error path, every mutation.',
      },
      {
        heading: 'The hydration pattern',
        body: 'Server components call controllers directly and hydrate the QueryClient via setQueryData. The layout wraps children in HydrationBoundary which serialises the cache to the client. Client components call useQuery with the same query key — the data is already there, no fetch needed. This pattern applies to the session (useUserTier reads from hydrated cache) and the budget overview (useBudgetOverview reads from hydrated cache, mutations invalidate and refetch via the route handler).',
      },
      {
        heading: 'When Nanostores would enter',
        body: 'If the application needed cross-feature client state — a global notification queue, a multi-step wizard shared across routes, or a collaborative editing buffer — Nanostores would be the right tool. Atom-based, no provider needed, each feature owns its atoms. But that need has not materialised. Adding Nanostores preemptively would be architecture for a problem that does not exist.',
      },
    ],
  },
];

const getCaseStudy = (slug: string): CaseStudy | undefined =>
  caseStudies.find((c) => c.slug === slug);

const getCaseSlugs = (): string[] => caseStudies.map((c) => c.slug);

export {
  caseStudies,
  getCaseStudy,
  getCaseSlugs,
  type CaseStudy,
  type CaseStudySection,
};
