'use server';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { deleteCookie } from '@/app/_entities/shared/session.service';

// TODO: When refresh token is stored client-side (second cookie),
// revoke the session in the DB here before deleting cookies.
// For now, JWT expires naturally (15min TTL).
const logoutAction = actionClient.action(async () => {
  await deleteCookie();
});

export { logoutAction };
