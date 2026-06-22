import { type DomainException, Query, type Result } from '@/core/shared/domain';

type GetItemOwnerResponse = Result<string, DomainException>;

class GetItemOwnerQuery extends Query<GetItemOwnerResponse> {
  static readonly type = 'GetItemOwnerQuery';

  constructor(readonly itemId: string) {
    super();
  }
}

export { GetItemOwnerQuery, type GetItemOwnerResponse };
