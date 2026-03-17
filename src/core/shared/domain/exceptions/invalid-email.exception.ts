import { DomainException } from './base.exception';

class InvalidEmailException extends DomainException {
  constructor(email: string) {
    // We log the specific email internally for debugging
    super(`Validation failed for email: ${email}`, 'UNAUTHORIZED');
  }
}

export { InvalidEmailException };
