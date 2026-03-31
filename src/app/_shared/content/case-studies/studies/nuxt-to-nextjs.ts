import { type CaseStudy } from '../types';

const nuxtToNextjs: CaseStudy = {
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
};

export { nuxtToNextjs };
