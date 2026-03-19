import { DomainException } from './base.exception';

class InvalidUserIdException extends DomainException {
  constructor() {
    // We log the specific userId internally for debugging
    super(`Validation failed for userid`, 'UNAUTHORIZED');
  }
}

export { InvalidUserIdException };
