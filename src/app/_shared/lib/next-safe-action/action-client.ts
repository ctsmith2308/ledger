import { createSafeActionClient } from 'next-safe-action';

import {
  toErrorResponse,
  logger,
  type ErrorResponse,
} from '@/core/shared/infrastructure';

const actionClient = createSafeActionClient({
  handleServerError: (error): ErrorResponse => {
    logger.error(error);

    return toErrorResponse(error);
  },
});

export { actionClient };
