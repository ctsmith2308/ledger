import { DomainException } from './base.exception';

class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export { ValidationException };
