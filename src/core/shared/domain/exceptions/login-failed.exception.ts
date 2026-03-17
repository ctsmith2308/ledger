import { DomainException } from './base.exception';

class LoginFailedException extends DomainException {
  constructor() {
    super('Login failed', 'LOGIN_FAILED');
  }
}

export { LoginFailedException };
