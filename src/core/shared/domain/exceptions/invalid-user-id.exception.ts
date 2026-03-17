import { DomainException } from './base.exception';

class InvalidUserIdException extends DomainException {
  constructor(userId: string) {
    // We log the specific userId internally for debugging
    super(`Validation failed for userid: ${userId}`, 'UNAUTHORIZED');
  }
}

export { InvalidUserIdException };
