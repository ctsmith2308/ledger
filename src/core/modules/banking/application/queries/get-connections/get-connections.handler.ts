import { IHandler, Result } from '@/core/shared/domain';

import { IPlaidItemRepository } from '@/core/modules/banking/domain';

import {
  GetConnectionsQuery,
  GetConnectionsResponse,
} from './get-connections.query';

class GetConnectionsHandler
  implements IHandler<GetConnectionsQuery, GetConnectionsResponse>
{
  constructor(
    private readonly plaidItemRepository: IPlaidItemRepository,
  ) {}

  async execute(
    query: GetConnectionsQuery,
  ): Promise<GetConnectionsResponse> {
    const items = await this.plaidItemRepository.findByUserId(query.userId);

    return Result.ok(items);
  }
}

export { GetConnectionsHandler };
