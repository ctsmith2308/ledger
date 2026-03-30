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
  GetAccountsQuery,
  GetAccountsHandler,
} from './application';

import {
  PlaidItemRepository,
  BankAccountRepository,
  PlaidClientService,
} from './infrastructure';


import { BankingController } from './api';

class BankingModule {
  private constructor() {}

  static init(): BankingController {
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

    queryBus.register(
      GetAccountsQuery,
      new GetAccountsHandler(repos.bankAccountRepository),
    );

    return new BankingController(commandBus, queryBus);
  }
}

const bankingController = BankingModule.init();

export { bankingController };

export * from './api';
