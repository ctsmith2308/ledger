import { trace, SpanStatusCode } from '@opentelemetry/api';

import { type IObservabilityService } from '@/core/shared/domain';

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
