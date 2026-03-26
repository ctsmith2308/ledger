'use server';

import { UnauthorizedException } from '@/core/shared/domain';
import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action';

import { getCookie } from '@/app/_entities/shared';

const getUserSessionAction = actionClient
  .action(async () => {
    const token = await getCookie();

    if (!token) throw new UnauthorizedException();

    const result = await identityController.getUserSession(token);

    return result.getValueOrThrow();
  });

export { getUserSessionAction };
