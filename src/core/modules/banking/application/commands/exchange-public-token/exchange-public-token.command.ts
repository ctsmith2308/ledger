import { Command, DomainException, Result } from '@/core/shared/domain';
import { PlaidItem } from '@/core/modules/banking/domain';

type ExchangePublicTokenResponse = Result<PlaidItem, DomainException>;

class ExchangePublicTokenCommand extends Command<ExchangePublicTokenResponse> {
  constructor(
    readonly userId: string,
    readonly publicToken: string,
  ) {
    super();
  }
}

export {
  ExchangePublicTokenCommand,
  type ExchangePublicTokenResponse,
};
