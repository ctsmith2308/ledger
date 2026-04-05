import { Query, DomainException, Result } from '@/core/shared/domain';

import { PlaidItem } from '@/core/modules/banking/domain';

type GetConnectionsResponse = Result<PlaidItem[], DomainException>;

class GetConnectionsQuery extends Query<GetConnectionsResponse> {
  static readonly type = 'GetConnectionsQuery';

  constructor(readonly userId: string) {
    super();
  }
}

export { GetConnectionsQuery, type GetConnectionsResponse };
