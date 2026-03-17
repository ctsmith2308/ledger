import { TRPCError } from '@trpc/server';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

import { mapError } from '@/core/shared/infrastructure/mappers';

const normalizedCodeToTRPCCode: Record<string, TRPC_ERROR_CODE_KEY> = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

const toTRPCError = (error: unknown): TRPCError => {
  const { code, message } = mapError(error);

  const trpcCode = normalizedCodeToTRPCCode[code] ?? 'INTERNAL_SERVER_ERROR';

  return new TRPCError({ code: trpcCode, message, cause: error });
};

export { toTRPCError };
