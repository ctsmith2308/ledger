import { DomainException } from './base.exception';

class InvalidTierException extends DomainException {
  constructor() {
    super('Validation failed for user tier', 'VALIDATION_ERROR');
  }
}

export { InvalidTierException };
