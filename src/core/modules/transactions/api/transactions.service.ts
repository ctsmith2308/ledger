import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  SyncTransactionsCommand,
  GetTransactionsQuery,
  GetSpendingByCategoryQuery,
} from '../application';

import {
  SpendingByCategoryMapper,
  SyncResultMapper,
  TransactionMapper,
} from './mappers';

import {
  type SpendingByCategoryDTO,
  type SyncResultDTO,
  type TransactionDTO,
} from './transactions.dto';

class TransactionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async syncTransactions(userId: string): Promise<SyncResultDTO> {
    const result = await this.commandBus.dispatch(
      new SyncTransactionsCommand(userId),
    );

    return SyncResultMapper.toDTO(result.getValueOrThrow());
  }

  async getTransactions(userId: string): Promise<TransactionDTO[]> {
    const result = await this.queryBus.dispatch(
      new GetTransactionsQuery(userId),
    );

    return TransactionMapper.toDTOList(result.getValueOrThrow());
  }

  async getSpendingByCategory(userId: string, month: Date): Promise<SpendingByCategoryDTO[]> {
    const result = await this.queryBus.dispatch(
      new GetSpendingByCategoryQuery(userId, month),
    );

    return SpendingByCategoryMapper.toDTOList(result.getValueOrThrow());
  }
}

export { TransactionsService };
