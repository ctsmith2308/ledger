import { DomainException } from './base.exception';

class InvalidEmailException extends DomainException {
  constructor() {
    // We log the specific email internally for debugging
    super(`Validation failed for email`, 'UNAUTHORIZED');
  }
}

export { InvalidEmailException };
