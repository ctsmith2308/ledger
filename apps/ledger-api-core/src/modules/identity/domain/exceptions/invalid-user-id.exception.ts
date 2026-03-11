import { DomainError } from '@/shared/domain/error';

class InvalidUserIdException extends DomainError {
  constructor(message: string = 'Id does not meet requirements') {
    super(message);
    this.name = 'InvalidUserIdException';
  }
}

export { InvalidUserIdException };
