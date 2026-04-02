import { type CaseStudy } from '../types';

const tanstackQuerySafeAction: CaseStudy = {
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
      body: 'Server actions are POST requests. next-safe-action wraps them with middleware chaining (.use(withAuth).use(withFeatureFlag)), input schema validation (.inputSchema()), and a typed error boundary (handleServerError). The handleActionResponse() utility bridges the serialisation gap — it unwraps the safe-action response and throws ActionError on failure, which TanStack Query catches via the global MutationCache onError handler. One toast, one error path, every mutation.',
    },
    {
      heading: 'The hydration pattern',
      body: 'Server components call module services directly and hydrate the QueryClient via setQueryData. The layout wraps children in HydrationBoundary which serialises the cache to the client. Client components call useQuery with the same query key — the data is already there, no fetch needed. This pattern applies to feature flags (useFeatureFlags reads from hydrated cache) and the budget overview (useBudgetOverview reads from hydrated cache, mutations invalidate and refetch via the route handler).',
    },
    {
      heading: 'When Nanostores would enter',
      body: 'If the application needed cross-feature client state — a global notification queue, a multi-step wizard shared across routes, or a collaborative editing buffer — Nanostores would be the right tool. Atom-based, no provider needed, each feature owns its atoms. But that need has not materialised. Adding Nanostores preemptively would be architecture for a problem that does not exist.',
    },
  ],
};

export { tanstackQuerySafeAction };
