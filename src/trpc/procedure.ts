import { internalLogger } from '@/core/shared/infrastructure/loggers';
import { resolveTraceId } from '@/core/shared/infrastructure/utils';

import { toTRPCError } from './mappers/error-mapper';
import { t } from './server';

const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  try {
    return await next();
  } catch (error: unknown) {
    const traceId = resolveTraceId(ctx.headers.get('x-correlation-id'));

    internalLogger(error, traceId);

    throw toTRPCError(error);
  }
});

export { publicProcedure };
