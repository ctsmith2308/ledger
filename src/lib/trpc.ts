'use client';

import { createTRPCClient, httpLink } from '@trpc/client';

import type { AppRouter } from '@/trpc/routers';

const trpcClient = createTRPCClient<AppRouter>({
  links: [httpLink({ url: '/api/trpc' })],
});

export { trpcClient };
