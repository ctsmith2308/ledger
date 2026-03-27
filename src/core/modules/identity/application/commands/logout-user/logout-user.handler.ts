import {
  IHandler,
  Result,
  UnauthorizedException,
} from '@/core/shared/domain';
import {
  SessionId,
  IUserSessionRepository,
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
  ) {}

  async execute(command: LogoutUserCommand): Promise<LogoutUserResponse> {
    const sessionIdResult = SessionId.create(command.sessionToken);

    if (sessionIdResult.isFailure) {
      return Result.fail(new UnauthorizedException());
    }

    const sessionId = sessionIdResult.value;

    await this.sessionRepository.revokeById(sessionId);

    return Result.ok(undefined);
  }
}

export { LogoutUserHandler };
