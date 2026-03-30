// TODO: Replace with OpenTelemetry SDK (@opentelemetry/sdk-node) + Grafana Cloud
// as the backend. Instrument via Next.js instrumentation.ts, export spans/logs
// to Grafana's OTLP endpoint. Same IObservabilityService interface — swap the
// implementation, not the consumers.
import { type IObservabilityService } from '@/core/shared/domain';

import { logger } from '../utils';

const ObservabilityService: IObservabilityService = {
  recordHandlerFailure(handlerName: string, error: unknown): void {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    const type =
      error instanceof Error ? error.constructor.name : 'UnknownError';

    logger.error({
      handler: handlerName,
      errorType: type,
      message,
    });
  },
};

export { ObservabilityService };
