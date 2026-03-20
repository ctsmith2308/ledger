import { Command, DomainException, Result } from '@/core/shared/domain';

type LoginUserResponseData = { jwt: string };

type LoginUserResponse = Result<LoginUserResponseData, DomainException>;

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {
    super();
  }
}

export { LoginUserCommand };
export type { LoginUserResponse, LoginUserResponseData };
