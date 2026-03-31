import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  CreateLinkTokenCommand,
  ExchangePublicTokenCommand,
  GetAccountsQuery,
} from '../application';

import { PlaidItemMapper, BankAccountMapper } from './mappers';

class BankingService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createLinkToken(userId: string) {
    const result = await this.commandBus.dispatch(
      new CreateLinkTokenCommand(userId),
    );

    const { linkToken } = result.getValueOrThrow();

    return { linkToken };
  }

  async exchangePublicToken(userId: string, publicToken: string) {
    const result = await this.commandBus.dispatch(
      new ExchangePublicTokenCommand(userId, publicToken),
    );

    return PlaidItemMapper.toDTO(result.getValueOrThrow());
  }

  async getAccounts(userId: string) {
    const result = await this.queryBus.dispatch(new GetAccountsQuery(userId));

    return BankAccountMapper.toDTOList(result.getValueOrThrow());
  }
}

export { BankingService };
