import { trace, SpanStatusCode } from '@opentelemetry/api';

import { createSafeActionClient } from 'next-safe-action';

import { z } from 'zod';

import {
  toErrorResponse,
  logger,
  type ErrorResponse,
} from '@/core/shared/infrastructure';

const tracer = trace.getTracer('ledger');

const actionClient = createSafeActionClient({
  defineMetadataSchema: () => z.object({ actionName: z.string() }),

  handleServerError: (error): ErrorResponse => {
    logger.error(error);

    return toErrorResponse(error);
  },
}).use(async ({ metadata, next }) => {
  const span = tracer.startSpan(`action.${metadata.actionName}`);

  try {
    const result = await next();
    span.end();

    return result;
  } catch (error) {
    span.recordException(error as Error);

    span.setStatus({ code: SpanStatusCode.ERROR });

    span.end();

    throw error;
  }
});

export { actionClient };
