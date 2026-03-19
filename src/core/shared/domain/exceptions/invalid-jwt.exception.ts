import { DomainException } from './base.exception';

class InvalidJwtException extends DomainException {
  constructor(message: string) {
    // We log the specific email internally for debugging
    super(message, 'UNAUTHORIZED');
  }
}

export { InvalidJwtException };
