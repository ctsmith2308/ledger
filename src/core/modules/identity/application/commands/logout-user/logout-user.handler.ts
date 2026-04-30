import {
  IHandler,
  IEventBus,
  Result,
  UnauthorizedException,
} from '@/core/shared/domain';
import {
  SessionId,
  IUserSessionRepository,
  UserLoggedOutEvent,
} from '@/core/modules/identity/domain';

import {
  LogoutUserCommand,
  LogoutUserResponse,
} from './logout-user.command';

/**
 * Revokes the user's session and dispatches a logout event.
 *
 * Idempotent: revocation proceeds even if the session is not found or
 * already revoked. The event is only dispatched when a session existed
 * so audit records reflect actual logouts, not no-ops.
 *
 * Handler-dispatched event: no single aggregate owns logout. The session
 * is revoked (not deleted) so the record persists for audit.
 */
class LogoutUserHandler
  implements IHandler<LogoutUserCommand, LogoutUserResponse>
{
  constructor(
    private readonly sessionRepository: IUserSessionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: LogoutUserCommand): Promise<LogoutUserResponse> {
    const sessionIdResult = SessionId.create(command.sessionToken);

    if (sessionIdResult.isFailure) {
      return Result.fail(new UnauthorizedException());
    }

    const sessionId = sessionIdResult.value;

    const session = await this.sessionRepository.findById(sessionId);

    await this.sessionRepository.revokeById(sessionId);

    if (session) {
      await this.eventBus.dispatch([
        new UserLoggedOutEvent(session.userId.value),
      ]);
    }

    return Result.ok(undefined);
  }
}

export { LogoutUserHandler };
