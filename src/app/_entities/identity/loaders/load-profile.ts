import { cache } from 'react';

import { identityController } from '@/core/modules/identity';

import { loadSession } from './load-session';

const loadProfile = cache(async () => {
  const session = await loadSession();

  const result = await identityController.getUserProfile(session.userId);

  return result.getValueOrThrow();
});

export { loadProfile };
