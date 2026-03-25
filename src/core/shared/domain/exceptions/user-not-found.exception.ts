import { DomainException } from './base.exception';

class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}

export { UserNotFoundException };
