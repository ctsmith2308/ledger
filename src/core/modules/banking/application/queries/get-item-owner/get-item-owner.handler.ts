import { type IHandler, Result, PlaidItemNotFoundException } from '@/core/shared/domain';

import { type IPlaidItemRepository } from '@/core/modules/banking/domain';

import {
  type GetItemOwnerResponse,
  GetItemOwnerQuery,
} from './get-item-owner.query';

class GetItemOwnerHandler
  implements IHandler<GetItemOwnerQuery, GetItemOwnerResponse>
{
  constructor(
    private readonly plaidItemRepository: IPlaidItemRepository,
  ) {}

  async execute(query: GetItemOwnerQuery): Promise<GetItemOwnerResponse> {
    const item = await this.plaidItemRepository.findById(query.itemId);

    if (!item) {
      return Result.fail(new PlaidItemNotFoundException());
    }

    return Result.ok(item.userId);
  }
}

export { GetItemOwnerHandler };
