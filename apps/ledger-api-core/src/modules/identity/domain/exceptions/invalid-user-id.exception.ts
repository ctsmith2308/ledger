import { DomainException } from '@/shared/domain/exception';

class InvalidUserIdException extends DomainException {
  public readonly code = 'INVALID_USER_ID';

  constructor(message = 'ID does not meet requirements') {
    super(message);
    this.name = 'InvalidUserIdException';
  }
}
export { InvalidUserIdException };
