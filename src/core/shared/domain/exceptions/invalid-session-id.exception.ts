import { DomainException } from './base.exception';

class InvalidSessionIdException extends DomainException {
  constructor() {
    super('Invalid session identifier.', 'INVALID_SESSION_ID');
  }
}

export { InvalidSessionIdException };
