import { cache } from 'react';

import { UnauthorizedException } from '@/core/shared/domain';
import { identityController } from '@/core/modules/identity';

import { getCookie } from '@/app/_entities/shared';

const loadSession = cache(async () => {
  const token = await getCookie();

  if (!token) throw new UnauthorizedException();

  const result = await identityController.getUserSession(token);

  return result.getValueOrThrow();
});

export { loadSession };
