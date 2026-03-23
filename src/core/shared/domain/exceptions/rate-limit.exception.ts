import { DomainException } from './base.exception';

class RateLimitException extends DomainException {
  constructor() {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
  }
}

export { RateLimitException };
