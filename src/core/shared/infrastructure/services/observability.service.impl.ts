import { trace, SpanStatusCode } from '@opentelemetry/api';

import { type IObservabilityService } from '@/core/shared/domain';

/**
 * Enriches the currently active span with handler failure details.
 * Does not create a new span. The buses (CommandBus, QueryBus) create
 * the parent span via startActiveSpan; this service annotates it on
 * failure so the error is visible in the trace without a separate
 * error-tracking integration.
 */
const ObservabilityService: IObservabilityService = {
  recordHandlerFailure(handlerName: string, error: unknown): void {
    const span = trace.getActiveSpan();

    if (!span) return;

    const message =
      error instanceof Error ? error.message : 'Unknown error';

    const type =
      error instanceof Error ? error.constructor.name : 'UnknownError';

    span.setAttribute('handler.name', handlerName);
    span.setAttribute('error.type', type);
    span.setAttribute('error.message', message);
    span.setStatus({ code: SpanStatusCode.ERROR, message });
  },
};

export { ObservabilityService };
