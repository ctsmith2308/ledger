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

/**
 * Completes the Plaid Link flow by exchanging the public token for a
 * permanent access token, then fetching and persisting the linked accounts.
 *
 * Ordering: the PlaidItem is saved before fetching accounts so the
 * access token is persisted even if the subsequent getAccounts call fails.
 * A failed getAccounts leaves an item with no accounts (orphaned), but
 * the access token is recoverable for a retry. The alternative (fetching
 * first) risks losing the access token entirely on a crash.
 *
 * Error handling: Plaid API failures are classified by the PlaidClientService
 * and thrown as PlaidErrorException with error details in the message.
 * The catch block passes the exception through as Result.fail.
 */
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

      const plaidItem = PlaidItem.create(
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
    } catch (error) {
      return Result.fail(error as PlaidErrorException);
    }
  }
}

export { ExchangePublicTokenHandler };
