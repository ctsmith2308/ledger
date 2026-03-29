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
