import { type ErrorResponse } from '@/core/shared/infrastructure';

import { ActionError } from './action-error';

type SafeActionResponse<T> = {
  data?: T;
  serverError?: ErrorResponse;
  validationErrors?: Record<string, unknown>;
};

const execute = async <T>(
  response: Promise<SafeActionResponse<T>>,
): Promise<T> => {
  const result = await response;

  if (result.serverError) {
    throw new ActionError(result.serverError.code, result.serverError.message);
  }

  if (result.validationErrors) {
    throw new ActionError('VALIDATION_ERROR', 'The request contains invalid data.');
  }

  return result.data as T;
};

export { execute };
