import { Result, DomainException } from '@/core/shared';

type LoginUserResponseData = { jwt: string };

type LoginUserResponse = Result<LoginUserResponseData, DomainException>;

interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
}

export type { LoginUserCommand, LoginUserResponse, LoginUserResponseData };
