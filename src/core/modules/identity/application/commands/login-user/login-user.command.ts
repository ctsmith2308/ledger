import { Command, DomainException, Result } from '@/core/shared/domain';
import { User } from '@/core/modules/identity/domain';

type LoginSuccess = { type: 'SUCCESS'; user: User };
type MfaRequired = { type: 'MFA_REQUIRED'; user: User };
type LoginResult = LoginSuccess | MfaRequired;

type LoginUserResponse = Result<LoginResult, DomainException>;

class LoginUserCommand extends Command<LoginUserResponse> {
  static readonly type = 'LoginUserCommand';

  constructor(
    readonly email: string,
    readonly password: string,
  ) {
    super();
  }
}

export {
  LoginUserCommand,
  type LoginUserResponse,
  type LoginResult,
  type LoginSuccess,
  type MfaRequired,
};
