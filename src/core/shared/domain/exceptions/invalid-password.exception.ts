import { DomainException } from './base.exception';

class InvalidPasswordException extends DomainException {
  constructor(userId: string) {
    // We log the specific user ID internally for security audits
    super(`Password mismatch for user: ${userId}`, 'UNAUTHORIZED');
  }
}

export { InvalidPasswordException };
