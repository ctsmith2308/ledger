import { Command, DomainException, Result } from '@/core/shared/domain';
import { UserSession } from '../../../domain/aggregates';

type LoginUserResponse = Result<UserSession, DomainException>;

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {
    super();
  }
}

export { LoginUserCommand, type LoginUserResponse };
