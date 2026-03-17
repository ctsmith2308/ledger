import { Result } from '@/core/shared/domain';
import { DomainException } from '@/core/shared/domain/exceptions';

type RegisterUserResponseData =
  | { type: 'SUCCESS'; id: string }
  | { type: 'PENDING_VERIFICATION'; message: string };

type RegisterUserResponse = Result<RegisterUserResponseData, DomainException>;

interface RegisterUserCommand {
  readonly email: string;
  readonly password: string;
}

export type {
  RegisterUserCommand,
  RegisterUserResponse,
  RegisterUserResponseData,
};
