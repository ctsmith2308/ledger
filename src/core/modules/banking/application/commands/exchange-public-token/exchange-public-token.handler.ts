import {
  IHandler,
  IEventBus,
  Result,
  PlaidErrorException,
} from '@/core/shared/domain';
import {
  IPlaidClient,
  IPlaidItemRepository,
  IBankAccountRepository,
  PlaidItem,
  BankAccount,
} from '@/core/modules/banking/domain';
import {
  ExchangePublicTokenCommand,
  ExchangePublicTokenResponse,
} from './exchange-public-token.command';

class ExchangePublicTokenHandler
  implements
    IHandler<ExchangePublicTokenCommand, ExchangePublicTokenResponse>
{
  constructor(
    private readonly plaidClient: IPlaidClient,
    private readonly plaidItemRepository: IPlaidItemRepository,
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(
    command: ExchangePublicTokenCommand,
  ): Promise<ExchangePublicTokenResponse> {
    try {
      const { accessToken, itemId } =
        await this.plaidClient.exchangePublicToken(command.publicToken);

      const plaidItem = PlaidItem.link(
        itemId,
        command.userId,
        accessToken,
      );

      await this.plaidItemRepository.save(plaidItem);

      const plaidAccounts =
        await this.plaidClient.getAccounts(accessToken);

      const accounts = plaidAccounts.map((acct) =>
        BankAccount.create(
          acct.accountId,
          plaidItem.id,
          acct.name,
          acct.officialName ?? undefined,
          acct.mask ?? undefined,
          acct.type,
          acct.subtype ?? undefined,
          acct.availableBalance ?? undefined,
          acct.currentBalance ?? undefined,
          acct.currencyCode ?? 'USD',
        ),
      );

      await this.bankAccountRepository.saveMany(accounts);

      const events = plaidItem.pullDomainEvents();

      await this.eventBus.dispatch(events);

      return Result.ok(plaidItem);
    } catch {
      return Result.fail(new PlaidErrorException());
    }
  }
}

export { ExchangePublicTokenHandler };
