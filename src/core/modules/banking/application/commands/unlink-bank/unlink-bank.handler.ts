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

/**
 * Unlinks a bank connection by removing the Plaid item, its accounts,
 * and all associated transactions.
 *
 * Ownership check: verifies the PlaidItem belongs to the requesting user
 * before proceeding. Returns UnauthorizedException if not.
 *
 * Resilient Plaid removal: if the Plaid API call to itemRemove fails
 * (token already revoked, Plaid outage), the error is logged but local
 * cleanup continues. The user should not be blocked from unlinking
 * locally because Plaid's remote state is inconsistent.
 *
 * Cascade order: transactions are deleted before the PlaidItem so no
 * orphaned transaction records reference deleted accounts.
 *
 * Cross-module dependency: imports ITransactionRepository from the
 * transactions module to cascade-delete transactions by account IDs.
 */
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
