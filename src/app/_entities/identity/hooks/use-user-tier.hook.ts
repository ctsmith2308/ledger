'use client';

import { useSession } from './use-session.hook';

const useUserTier = () => {
  const session = useSession();

  const tier = session?.tier ?? null;
  const isDemo = tier === 'DEMO';

  return { tier, isDemo };
};

export { useUserTier };
