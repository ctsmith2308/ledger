import { IHandler, Result } from '@/core/shared/domain';

import { IBankAccountRepository } from '@/core/modules/banking/domain';

import { GetAccountsQuery, GetAccountsResponse } from './get-accounts.query';

class GetAccountsHandler implements IHandler<
  GetAccountsQuery,
  GetAccountsResponse
> {
  constructor(private readonly bankAccountRepository: IBankAccountRepository) {}

  async execute(query: GetAccountsQuery): Promise<GetAccountsResponse> {
    const accounts = await this.bankAccountRepository.findByUserId(
      query.userId,
    );

    return Result.ok(accounts);
  }
}

export { GetAccountsHandler };
