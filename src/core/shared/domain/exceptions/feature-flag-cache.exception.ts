import { DomainException } from './base.exception';

class FeatureFlagCacheException extends DomainException {
  constructor(cause?: unknown) {
    super(
      'Feature flag service is temporarily unavailable.',
      'FEATURE_FLAG_CACHE_ERROR',
    );
    this.cause = cause;
  }
}

export { FeatureFlagCacheException };
