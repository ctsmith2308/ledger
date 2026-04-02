import { trace, SpanStatusCode } from '@opentelemetry/api';

import { createMiddleware } from 'next-safe-action';

import { FeatureDisabledException } from '@/core/shared/domain';

import { featureFlagCache } from '@/core/shared/infrastructure';

import { identityService } from '@/core/modules/identity';

const tracer = trace.getTracer('ledger');

const withFeatureFlag = (feature: string) =>
  createMiddleware().define(async ({ ctx, next }) => {
    const { userId } = ctx as { userId: string };

    const span = tracer.startSpan('middleware.withFeatureFlag');

    span.setAttribute('feature', feature);

    span.setAttribute('userId', userId);

    try {
      let features = await featureFlagCache.getFeatures(userId);

      if (!features) {
        span.addEvent('cache_miss');

        const account = await identityService.getUserAccount(userId);

        features = account.features;

        await featureFlagCache.setFeatures(userId, features);
      } else {
        span.addEvent('cache_hit');
      }

      if (!features.includes(feature)) {
        throw new FeatureDisabledException();
      }

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

export { withFeatureFlag };
