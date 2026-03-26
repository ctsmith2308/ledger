import { Result } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  CreateLinkTokenCommand,
  ExchangePublicTokenCommand,
  GetAccountsQuery,
} from '../application';

import { PlaidItemMapper, BankAccountMapper } from './mappers';

class BankingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createLinkToken(userId: string) {
    const result = await this.commandBus.dispatch(
      new CreateLinkTokenCommand(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok({ linkToken: result.value.linkToken });
  }

  async exchangePublicToken(userId: string, publicToken: string) {
    const result = await this.commandBus.dispatch(
      new ExchangePublicTokenCommand(userId, publicToken),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(PlaidItemMapper.toDTO(result.value));
  }

  async getAccounts(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetAccountsQuery(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(BankAccountMapper.toDTOList(result.value));
  }
}

export { BankingController };
