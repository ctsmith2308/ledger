import { DomainException } from './base.exception';

class SessionExpiredException extends DomainException {
  constructor() {
    super('Session has expired.', 'SESSION_EXPIRED');
  }
}

export { SessionExpiredException };
