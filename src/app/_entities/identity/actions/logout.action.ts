'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { getCookie, deleteCookie } from '@/app/_entities/shared';

const logoutAction = actionClient.action(async () => {
  const token = await getCookie();

  if (token) {
    await identityController.logoutUser(token);
  }

  await deleteCookie();
});

export { logoutAction };
