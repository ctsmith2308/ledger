import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  SyncTransactionsCommand,
  GetTransactionsQuery,
  GetSpendingByCategoryQuery,
  GetSpendingPeriodsQuery,
} from '../application';

import {
  SpendingByCategoryMapper,
  SpendingPeriodsMapper,
  SyncResultMapper,
  TransactionMapper,
} from './mappers';

import {
  type SpendingByCategoryDTO,
  type SpendingPeriodsDTO,
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

  async getSpendingPeriods(userId: string): Promise<SpendingPeriodsDTO> {
    const result = await this.queryBus.dispatch(
      new GetSpendingPeriodsQuery(userId),
    );

    return SpendingPeriodsMapper.toDTO(result.getValueOrThrow());
  }
}

export { TransactionsService };
