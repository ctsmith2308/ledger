'use server';

import { coreApi } from '@/core';
import { SessionService, createAction } from '@/app/_lib';

const handler = async () => {
  const session = await SessionService.get();

  const { userId } = session.getValueOrThrow();

  const result = await coreApi.identity.getUserProfile(userId);

  return result.getValueOrThrow();
};

const userSessionAction = createAction({ handler, protected: true });

export { userSessionAction };
