import { Command, DomainException, Result } from '@/core/shared/domain';

type LoginTokens = {
  accessToken: string;
  refreshToken: string;
};

type LoginUserResponse = Result<LoginTokens, DomainException>;

class LoginUserCommand extends Command<LoginUserResponse> {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {
    super();
  }
}

export { LoginUserCommand, type LoginUserResponse, type LoginTokens };
