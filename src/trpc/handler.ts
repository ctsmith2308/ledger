import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import type { Context } from '@/trpc/init';
import { appRouter } from '@/trpc/routers';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: ({ req }): Context => ({ headers: req.headers }),
  });

export { handler };
