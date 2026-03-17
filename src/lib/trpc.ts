'use client';

import { createTRPCClient, httpBatchLink } from '@trpc/client';

import type { AppRouter } from '@/trpc/routers';

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

export { trpcClient };
