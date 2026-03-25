import {
  IHandler,
  Result,
  UnauthorizedException,
  SessionExpiredException,
  SessionRevokedException,
} from '@/core/shared/domain';

import {
  SessionId,
  IUserSessionRepository,
} from '@/core/modules/identity/domain';

import {
  GetUserSessionQuery,
  GetUserSessionResponse,
} from './get-user-session.query';

class GetUserSessionHandler implements IHandler<
  GetUserSessionQuery,
  GetUserSessionResponse
> {
  constructor(private readonly sessionRepository: IUserSessionRepository) {}

  async execute(query: GetUserSessionQuery): Promise<GetUserSessionResponse> {
    const sessionIdResult = SessionId.create(query.token);

    if (sessionIdResult.isFailure)
      return Result.fail(new UnauthorizedException());

    const sessionId = sessionIdResult.value;

    const session = await this.sessionRepository.findById(sessionId);

    if (!session) return Result.fail(new UnauthorizedException());

    if (session.isExpired) return Result.fail(new SessionExpiredException());

    if (session.isRevoked) return Result.fail(new SessionRevokedException());

    return Result.ok(session);
  }
}

export { GetUserSessionHandler };
