import { Query, DomainException, Result } from '@/core/shared/domain';
import { UserSession } from '../../../domain/aggregates';

type GetUserSessionResponse = Result<UserSession, DomainException>;

class GetUserSessionQuery extends Query<GetUserSessionResponse> {
  constructor(readonly token: string) {
    super();
  }
}

export { GetUserSessionQuery, type GetUserSessionResponse };
