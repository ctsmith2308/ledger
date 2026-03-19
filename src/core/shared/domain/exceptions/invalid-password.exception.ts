import { DomainException } from './base.exception';

class InvalidPasswordException extends DomainException {
  constructor() {
    // We log the specific user ID internally for security audits
    super(`Password mismatch for user`, 'UNAUTHORIZED');
  }
}

export { InvalidPasswordException };
