import { DomainException } from './base.exception';

class AccountNotFoundException extends DomainException {
  constructor(message = 'Account not found.') {
    super(message, 'ACCOUNT_NOT_FOUND');
  }
}

export { AccountNotFoundException };
