import { Result } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  SyncTransactionsCommand,
  GetTransactionsQuery,
  GetSpendingByCategoryQuery,
} from '../application';

import { TransactionMapper } from './mappers';

class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async syncTransactions(userId: string) {
    const result = await this.commandBus.dispatch(
      new SyncTransactionsCommand(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok({
          added: result.value.added,
          modified: result.value.modified,
          removed: result.value.removed,
        });
  }

  async getTransactions(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetTransactionsQuery(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(TransactionMapper.toDTOList(result.value));
  }

  async getSpendingByCategory(userId: string, month: Date) {
    const result = await this.queryBus.dispatch(
      new GetSpendingByCategoryQuery(userId, month),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(result.value);
  }
}

export { TransactionsController };
