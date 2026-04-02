import { DomainException } from './base.exception';

class InvalidEmailException extends DomainException {
  constructor() {
    super(`Validation failed for email`, 'UNAUTHORIZED');
  }
}

export { InvalidEmailException };
