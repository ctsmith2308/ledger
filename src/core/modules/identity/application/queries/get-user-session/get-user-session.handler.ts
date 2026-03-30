import {
  IHandler,
  Result,
  UnauthorizedException,
  SessionRevokedException,
  UserNotFoundException,
} from '@/core/shared/domain';

import {
  SessionId,
  IUserSessionRepository,
} from '@/core/modules/identity/domain';

import {
  GetUserSessionQuery,
  GetUserSessionResponse,
} from './get-user-session.query';

// TODO: Refresh flow implementation
// - Add IUserRepository and IJwtService as constructor deps
// - Fetch user for JWT payload (email, tier)
// - Sign fresh access token via jwtService.sign()
// - Return LoginTokens { accessToken, refreshToken }
// - Update GetUserSessionResponse type to match
// - Wire new deps in identity.module.ts

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

    if (session.isRevoked) return Result.fail(new SessionRevokedException());

    // TODO: Fetch user, sign JWT, return { accessToken, refreshToken }
    return Result.ok(session);
  }
}

export { GetUserSessionHandler };
