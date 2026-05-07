import {
  type IHandler,
  Result,
  UnauthorizedException,
} from '@/core/shared/domain';

import {
  type IUserSessionRepository,
  SessionId,
} from '@/core/modules/identity/domain';

import {
  RefreshSessionCommand,
  type RefreshSessionResponse,
} from './refresh-session.command';

/**
 * Validates a session for token refresh. Looks up the session by ID,
 * checks it hasn't been revoked or expired, and returns the session
 * aggregate. The service layer signs a new access JWT from the result.
 *
 * This is a query-like command — it reads state but doesn't mutate it.
 * It lives as a command because the service layer uses the result to
 * sign a new JWT, which is a side effect of the refresh flow.
 */
class RefreshSessionHandler
  implements IHandler<RefreshSessionCommand, RefreshSessionResponse>
{
  constructor(
    private readonly sessionRepository: IUserSessionRepository,
  ) {}

  async execute(
    command: RefreshSessionCommand,
  ): Promise<RefreshSessionResponse> {
    const sessionId = SessionId.from(command.sessionId);

    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      return Result.fail(new UnauthorizedException());
    }

    if (!session.isValid) {
      return Result.fail(new UnauthorizedException());
    }

    return Result.ok(session);
  }
}

export { RefreshSessionHandler };
