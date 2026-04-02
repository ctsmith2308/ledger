'use server';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { deleteCookie } from '@/app/_shared/lib/session/session.service';

// TODO: When refresh token is stored client-side (second cookie),
// revoke the session in the DB here before deleting cookies.
// For now, JWT expires naturally (15min TTL).
const logoutAction = actionClient
  .metadata({ actionName: 'logoutUser' })
  .action(async () => {
  await deleteCookie();
});

export { logoutAction };
