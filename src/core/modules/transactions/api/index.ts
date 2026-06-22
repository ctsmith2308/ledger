import {
  commandBus,
  queryBus,
  eventBus,
  prisma,
} from '@/core/shared/infrastructure';

import {
  PlaidItemRepository,
  PlaidClientService,
} from '@/core/modules/banking/infrastructure';

import {
  SyncTransactionsCommand,
  SyncTransactionsHandler,
  GetTransactionsQuery,
  GetTransactionsHandler,
  GetSpendingByCategoryQuery,
  GetSpendingByCategoryHandler,
  GetSpendingPeriodsQuery,
  GetSpendingPeriodsHandler,
} from '../application';

import {
  TransactionRepository,
  CategoryRollupRepository,
} from '../infrastructure';

import { TransactionsService } from './transactions.service';

class TransactionsModule {
  private constructor() {}

  static init(): TransactionsService {
    const repos = {
      transactionRepository: new TransactionRepository(prisma),
      plaidItemRepository: new PlaidItemRepository(prisma),
      categoryRollupRepository: new CategoryRollupRepository(prisma),
    };

    const services = {
      plaidClient: PlaidClientService.create(),
    };

    commandBus.register(
      SyncTransactionsCommand,
      new SyncTransactionsHandler(
        repos.plaidItemRepository,
        repos.transactionRepository,
        repos.categoryRollupRepository,
        services.plaidClient,
        eventBus,
      ),
    );

    queryBus.register(
      GetTransactionsQuery,
      new GetTransactionsHandler(repos.transactionRepository),
    );

    queryBus.register(
      GetSpendingByCategoryQuery,
      new GetSpendingByCategoryHandler(repos.categoryRollupRepository),
    );

    queryBus.register(
      GetSpendingPeriodsQuery,
      new GetSpendingPeriodsHandler(repos.categoryRollupRepository),
    );

    return new TransactionsService(commandBus, queryBus);
  }
}

const transactionsService = TransactionsModule.init();

export { transactionsService, type TransactionsService };
export * from './transactions.dto';
