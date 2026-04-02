import { IHandler, Result } from '@/core/shared/domain';

import { ITransactionRepository } from '@/core/modules/transactions/domain';

import {
  GetTransactionsQuery,
  GetTransactionsResponse,
} from './get-transactions.query';

class GetTransactionsHandler implements IHandler<
  GetTransactionsQuery,
  GetTransactionsResponse
> {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(query: GetTransactionsQuery): Promise<GetTransactionsResponse> {
    const transactions = await this.transactionRepository.findByUserId(
      query.userId,
    );

    return Result.ok(transactions);
  }
}

export { GetTransactionsHandler };
