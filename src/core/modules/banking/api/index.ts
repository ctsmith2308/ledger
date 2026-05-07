import {
  commandBus,
  queryBus,
  eventBus,
  prisma,
} from '@/core/shared/infrastructure';

import {
  CreateLinkTokenCommand,
  CreateLinkTokenHandler,
  ExchangePublicTokenCommand,
  ExchangePublicTokenHandler,
  UnlinkBankCommand,
  UnlinkBankHandler,
  GetAccountsQuery,
  GetAccountsHandler,
  GetConnectionsQuery,
  GetConnectionsHandler,
  GetItemOwnerQuery,
  GetItemOwnerHandler,
} from '../application';

import { TransactionRepository } from '@/core/modules/transactions/infrastructure';

import {
  PlaidItemRepository,
  BankAccountRepository,
  PlaidClientService,
} from '../infrastructure';

import { BankingService } from './banking.service';

class BankingModule {
  private constructor() {}

  static init(): BankingService {
    const plaidClient = PlaidClientService.create();

    const repos = {
      plaidItemRepository: new PlaidItemRepository(prisma),
      bankAccountRepository: new BankAccountRepository(prisma),
    };

    const services = {
      eventBus,
    };

    commandBus.register(
      CreateLinkTokenCommand,
      new CreateLinkTokenHandler(plaidClient),
    );

    commandBus.register(
      ExchangePublicTokenCommand,
      new ExchangePublicTokenHandler(
        plaidClient,
        repos.plaidItemRepository,
        repos.bankAccountRepository,
        services.eventBus,
      ),
    );

    commandBus.register(
      UnlinkBankCommand,
      new UnlinkBankHandler(
        plaidClient,
        repos.plaidItemRepository,
        repos.bankAccountRepository,
        new TransactionRepository(prisma),
        services.eventBus,
      ),
    );

    queryBus.register(
      GetAccountsQuery,
      new GetAccountsHandler(repos.bankAccountRepository),
    );

    queryBus.register(
      GetConnectionsQuery,
      new GetConnectionsHandler(repos.plaidItemRepository),
    );

    queryBus.register(
      GetItemOwnerQuery,
      new GetItemOwnerHandler(repos.plaidItemRepository),
    );

    return new BankingService(commandBus, queryBus);
  }
}

const bankingService = BankingModule.init();

export { bankingService, type BankingService };
export * from './banking.dto';
