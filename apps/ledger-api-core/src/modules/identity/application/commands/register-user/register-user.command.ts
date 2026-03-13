import { Command } from '@nestjs/cqrs';
import { Result } from '@/shared/domain';
import {
  InvalidEmailException,
  InvalidPasswordException,
} from '@/modules/identity/domain/exceptions';

/**
 * Discriminated union
 */
type RegisteredUserData =
  | { status: 'SUCCESS'; id: string; email: string }
  | { status: 'PENDING_VERIFICATION'; message: string };

type RegisterUserResponse = Result<
  RegisteredUserData,
  InvalidEmailException | InvalidPasswordException | Error
>;

class RegisterUserCommand extends Command<RegisterUserResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

export { RegisterUserCommand, type RegisterUserResponse };
