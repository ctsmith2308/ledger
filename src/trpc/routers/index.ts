import { router } from '@/trpc/init';

import { identityRouter } from './identity';

const appRouter = router({
  identity: identityRouter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
