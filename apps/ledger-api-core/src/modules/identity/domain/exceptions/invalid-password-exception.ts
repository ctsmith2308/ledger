import { DomainException } from '@/shared/domain';

class InvalidPasswordException extends DomainException {
  public readonly code = 'WEAK_PASSWORD';

  constructor(message = 'Password does not meet security requirements') {
    super(message);
    this.name = 'InvalidPasswordException';
  }
}
export { InvalidPasswordException };
