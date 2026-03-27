import { Command, DomainException, Result } from '@/core/shared/domain';

type LogoutUserResponse = Result<void, DomainException>;

class LogoutUserCommand extends Command<LogoutUserResponse> {
  constructor(readonly sessionToken: string) {
    super();
  }
}

export { LogoutUserCommand, type LogoutUserResponse };
