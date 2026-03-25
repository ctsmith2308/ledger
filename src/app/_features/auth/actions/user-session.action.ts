'use server';

import { identityController } from '@/core/modules/identity';
import { SessionService, createAction } from '@/app/_lib';

const handler = async () => {
  const session = await SessionService.get();

  const { userId } = session.getValueOrThrow();

  const result = await identityController.getUserProfile(userId);

  return result.getValueOrThrow();
};

const userSessionAction = createAction({ handler, protected: true });

export { userSessionAction };
