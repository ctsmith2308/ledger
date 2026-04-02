import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  CreateLinkTokenCommand,
  ExchangePublicTokenCommand,
  GetAccountsQuery,
} from '../application';

import {
  BankAccountMapper,
  LinkTokenMapper,
  PlaidItemMapper,
} from './mappers';

import {
  type BankAccountDTO,
  type LinkTokenDTO,
  type PlaidItemDTO,
} from './banking.dto';

class BankingService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createLinkToken(userId: string): Promise<LinkTokenDTO> {
    const result = await this.commandBus.dispatch(
      new CreateLinkTokenCommand(userId),
    );

    return LinkTokenMapper.toDTO(result.getValueOrThrow());
  }

  async exchangePublicToken(userId: string, publicToken: string): Promise<PlaidItemDTO> {
    const result = await this.commandBus.dispatch(
      new ExchangePublicTokenCommand(userId, publicToken),
    );

    return PlaidItemMapper.toDTO(result.getValueOrThrow());
  }

  async getAccounts(userId: string): Promise<BankAccountDTO[]> {
    const result = await this.queryBus.dispatch(new GetAccountsQuery(userId));

    return BankAccountMapper.toDTOList(result.getValueOrThrow());
  }
}

export { BankingService };
