import { DomainException } from './base.exception';

class PlaidItemNotFoundException extends DomainException {
  constructor() {
    super('Plaid item not found', 'PLAID_ITEM_NOT_FOUND');
  }
}

export { PlaidItemNotFoundException };
