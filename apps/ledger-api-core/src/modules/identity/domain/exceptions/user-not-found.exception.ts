import { DomainException } from '@/shared/domain';

class UserNotFoundError extends DomainException {
  public readonly code = 'USER_NOT_FOUND';

  constructor(message = 'User profile not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export { UserNotFoundError };
