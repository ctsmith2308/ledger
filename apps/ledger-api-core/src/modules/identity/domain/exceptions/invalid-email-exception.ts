import { DomainError } from '@/shared/domain/error';

class InvalidEmailException extends DomainError {
  constructor(message: string = 'Email does not meet email requirements') {
    super(message);
    this.name = 'InvalidEmailException';
  }
}

export { InvalidEmailException };
