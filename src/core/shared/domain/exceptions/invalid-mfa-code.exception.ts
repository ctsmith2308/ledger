import { DomainException } from './base.exception';

class InvalidMfaCodeException extends DomainException {
  constructor() {
    super('Invalid MFA code', 'UNAUTHORIZED');
  }
}

export { InvalidMfaCodeException };
