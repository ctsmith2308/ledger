import { DomainException } from './base.exception';

class UnauthorizedException extends DomainException {
  constructor() {
    super('Unauthorized', 'UNAUTHORIZED');
  }
}

export { UnauthorizedException };
