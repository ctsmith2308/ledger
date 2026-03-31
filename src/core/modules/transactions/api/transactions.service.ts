import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  SyncTransactionsCommand,
  GetTransactionsQuery,
  GetSpendingByCategoryQuery,
} from '../application';

import { TransactionMapper } from './mappers';

class TransactionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async syncTransactions(userId: string) {
    const result = await this.commandBus.dispatch(
      new SyncTransactionsCommand(userId),
    );

    const { added, modified, removed } = result.getValueOrThrow();

    return { added, modified, removed };
  }

  async getTransactions(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetTransactionsQuery(userId),
    );

    return TransactionMapper.toDTOList(result.getValueOrThrow());
  }

  async getSpendingByCategory(userId: string, month: Date) {
    const result = await this.queryBus.dispatch(
      new GetSpendingByCategoryQuery(userId, month),
    );

    return result.getValueOrThrow();
  }
}

export { TransactionsService };
