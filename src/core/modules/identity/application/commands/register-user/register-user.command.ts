import { Command, DomainException, Result } from '@/core/shared/domain';

import { User } from '@/core/modules/identity/domain';

type RegisterUserResult =
  | { type: 'SUCCESS'; user: User }
  | { type: 'PENDING_VERIFICATION' };

type RegisterUserResponse = Result<RegisterUserResult, DomainException>;

class RegisterUserCommand extends Command<RegisterUserResponse> {
  constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly password: string,
  ) {
    super();
  }
}

export {
  RegisterUserCommand,
  type RegisterUserResponse,
  type RegisterUserResult,
};
