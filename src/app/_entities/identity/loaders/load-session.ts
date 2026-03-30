import { cache } from 'react';

import { UnauthorizedException } from '@/core/shared/domain';
import { JwtService } from '@/core/shared/infrastructure';

import { getCookie } from '@/app/_entities/shared';

const loadSession = cache(async () => {
  const token = await getCookie();

  if (!token) throw new UnauthorizedException();

  const result = await JwtService.verify(token);

  const jwt = result.getValueOrThrow();

  return jwt;
});

export { loadSession };
