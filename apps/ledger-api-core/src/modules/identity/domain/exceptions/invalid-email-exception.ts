import { DomainException } from '@/shared/domain/exception';

class InvalidEmailException extends DomainException {
  public readonly code = 'INVALID_EMAIL';

  constructor(message = 'Email does not meet requirements') {
    super(message);
    this.name = 'InvalidEmailException';
  }
}

export { InvalidEmailException };
