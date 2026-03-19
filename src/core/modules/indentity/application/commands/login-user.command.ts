import { Result } from '@/core/shared/domain';
import { DomainException } from '@/core/shared/domain/exceptions';

type LoginUserResponseData = { jwt: string };

type RegisterUserResponse = Result<LoginUserResponseData, DomainException>;

interface LoginUserCommand {
  readonly email: string;
  readonly password: string;
}

export type { LoginUserCommand, RegisterUserResponse, LoginUserResponseData };
