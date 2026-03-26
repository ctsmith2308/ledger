import { DomainException } from './base.exception';

class PlaidErrorException extends DomainException {
  constructor(message = 'A banking service error occurred.') {
    super(message, 'PLAID_ERROR');
  }
}

export { PlaidErrorException };
