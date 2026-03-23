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
      'Ledger started with tRPC as the API layer — end-to-end type safety, a clean procedure model, and genuine framework portability. The switch to Next.js server actions was a deliberate tradeoff: less portability, significantly less ceremony. Here is the honest accounting of both sides.',
    sections: [
      {
        heading: 'Why tRPC first',
        body: 'tRPC gives you end-to-end type safety without a code generator, a clean middleware model in `procedure.ts`, and adapters for every major framework. The portability argument was real — swap the route handler, keep everything else. TanStack Query and Nanostores made the client layer framework-agnostic too. The full stack could move to SvelteKit or Nuxt with surface-level changes only.',
        table: {
          headers: ['Concern', 'tRPC', 'Server Actions'],
          rows: [
            ['API layer', 'tRPC — adapter swap to port', 'Next.js only'],
            [
              'Auth',
              'httpOnly cookie via tRPC context',
              'Next.js session/cookie handling',
            ],
            [
              'Server state',
              'TanStack Query — React, Vue, Svelte adapters',
              'use(), useFormState() — React only',
            ],
            [
              'Type safety',
              'End-to-end via tRPC, no code generation',
              'Server action return types only',
            ],
            [
              'Middleware',
              'Once in procedure.ts, applied everywhere',
              'Per-action wrapper (createAction HOF)',
            ],
            [
              'Bundle',
              'tRPC client + TanStack Query',
              'Zero additional client bundle',
            ],
          ],
        },
      },
      {
        heading: 'The tipping point',
        body: 'The tipping point was not a technical failure of tRPC — it was a scope question. This is a portfolio project, not a product targeting multiple frameworks. The portability argument is compelling in theory, but there is no SvelteKit migration on the roadmap. Carrying the tRPC mental model, the adapter wiring, and the TanStack Query setup for a benefit that would never be realised was ceremony without payoff. Server actions with a `createAction` HOF cover the same ground — auth check, error boundary, consistent response shape — with zero client bundle overhead and no additional dependency.',
      },
      {
        heading: 'What the createAction factory recovers',
        body: "The main thing tRPC provided was a shared middleware model. `createAction` replicates this: `protected: true` resolves the session before the handler runs, the catch block maps all failures to a consistent `ActionResult<T>`, and TypeScript narrows the handler signature based on the config discriminant. It is not as elegant as tRPC's procedure chain, but it covers the use cases this project actually has.",
        code: {
          label: 'createAction vs tRPC procedure — equivalent patterns',
          code: `// tRPC — middleware chain
const protectedProcedure = publicProcedure.use(authMiddleware);
const loginRouter = router({ login: publicProcedure.mutation(...) });

// createAction — HOF with discriminated union config
const loginAction = createAction({ handler: async (input) => { ... } });
const getProfileAction = createAction({ protected: true, handler: async (session, input) => { ... } });`,
        },
      },
      {
        heading: 'What was genuinely lost',
        body: 'Framework portability is the real loss. If the project ever needs to run outside of Next.js, the transport layer is now coupled to the framework. The domain core (`src/core/`) remains portable — it has zero Next.js dependencies. But the action layer would need to be rewritten, not just re-adapted. For a portfolio project, this is an acceptable tradeoff. For a product with an uncertain frontend future, it would not be.',
      },
      {
        heading: 'The interview answer',
        body: 'The honest version: tRPC is the better technical choice if framework portability is a requirement. Server actions with createAction are the better pragmatic choice for a Next.js-committed project. Knowing the difference — and being able to articulate the tradeoffs without advocating for one as universally correct — is the point.',
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
        body: "NestJS provides a structured module system, a built-in DI container, and a decorator-driven model that maps cleanly onto familiar patterns from Angular and Spring. The opinions are well-considered and the ecosystem is mature. For teams onboarding developers at scale, the conventions are a genuine asset — everyone lands in the same place.",
      },
      {
        heading: 'Where the overhead accumulated',
        body: "The DI container was the main cost. Every dependency had to be registered, decorated, and resolved through the framework machinery. Adding a new service meant touching the module definition, the provider list, and the injection tokens — three files for what should be a one-line constructor argument. The decorator surface area grew fast, and the mental model required to reason about instantiation order was non-trivial.",
        table: {
          headers: ['Concern', 'NestJS', 'Static factories + closures'],
          rows: [
            ['Dependency wiring', 'DI container, decorators, modules', 'Explicit constructor arguments'],
            ['New service cost', 'Provider registration + module update', 'Add parameter, done'],
            ['Testability', 'TestingModule setup per test', 'Pass mock directly'],
            ['Framework coupling', 'Deep — decorators throughout', 'None in domain/application layers'],
            ['Onboarding overhead', 'High — container mental model required', 'Low — plain TypeScript'],
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
