import { DomainException } from './base.exception';

class InvalidAmountException extends DomainException {
  constructor(message = 'Invalid amount.') {
    super(message, 'INVALID_AMOUNT');
  }
}

export { InvalidAmountException };
