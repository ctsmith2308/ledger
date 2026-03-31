import { type CaseStudy } from '../types';

const trpcVsServerActions: CaseStudy = {
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
};

export { trpcVsServerActions };
