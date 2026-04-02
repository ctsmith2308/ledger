import { Command, DomainException, Result } from '@/core/shared/domain';

type LogoutUserResponse = Result<void, DomainException>;

class LogoutUserCommand extends Command<LogoutUserResponse> {
  static readonly type = 'LogoutUserCommand';

  constructor(readonly sessionToken: string) {
    super();
  }
}

export { LogoutUserCommand, type LogoutUserResponse };
