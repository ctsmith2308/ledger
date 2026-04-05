import {
  IHandler,
  IEventBus,
  Result,
  PlaidItemNotFoundException,
  UnauthorizedException,
} from '@/core/shared/domain';

import { logger } from '@/core/shared/infrastructure';

import {
  IPlaidItemRepository,
  IBankAccountRepository,
  IPlaidClient,
  BankAccountUnlinkedEvent,
} from '@/core/modules/banking/domain';

import { type ITransactionRepository } from '@/core/modules/transactions/domain';

import { UnlinkBankCommand, UnlinkBankResponse } from './unlink-bank.command';

class UnlinkBankHandler
  implements IHandler<UnlinkBankCommand, UnlinkBankResponse>
{
  constructor(
    private readonly plaidClient: IPlaidClient,
    private readonly plaidItemRepository: IPlaidItemRepository,
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: UnlinkBankCommand): Promise<UnlinkBankResponse> {
    const plaidItem = await this.plaidItemRepository.findById(
      command.plaidItemId,
    );

    if (!plaidItem) {
      return Result.fail(new PlaidItemNotFoundException());
    }

    if (plaidItem.userId !== command.userId) {
      return Result.fail(new UnauthorizedException());
    }

    const accounts = await this.bankAccountRepository.findByPlaidItemId(
      plaidItem.id,
    );
    const accountIds = accounts.map((a) => a.id);

    try {
      await this.plaidClient.itemRemove(plaidItem.accessToken);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Plaid itemRemove failed';
      logger.error(
        `Plaid itemRemove failed for ${plaidItem.id} — ${message}. Proceeding with local cleanup.`,
      );
    }

    if (accountIds.length > 0) {
      await this.transactionRepository.deleteByAccountIds(accountIds);
    }

    await this.plaidItemRepository.deleteById(plaidItem.id);

    await this.eventBus.dispatch([
      new BankAccountUnlinkedEvent(
        plaidItem.id,
        command.userId,
        plaidItem.institutionId,
      ),
    ]);

    return Result.ok(undefined);
  }
}

export { UnlinkBankHandler };
