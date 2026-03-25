import { DomainException } from './base.exception';

class SessionRevokedException extends DomainException {
  constructor() {
    super('Session has been revoked.', 'SESSION_REVOKED');
  }
}

export { SessionRevokedException };
