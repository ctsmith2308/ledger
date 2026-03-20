import { Command, DomainException, Result } from '@/core/shared/domain';

type RegisterUserResponseData =
  | { type: 'SUCCESS'; id: string }
  | { type: 'PENDING_VERIFICATION'; message: string };

type RegisterUserResponse = Result<RegisterUserResponseData, DomainException>;

class RegisterUserCommand extends Command<RegisterUserResponse> {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {
    super();
  }
}

export { RegisterUserCommand };
export type { RegisterUserResponse, RegisterUserResponseData };
