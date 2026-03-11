import { Command } from '@nestjs/cqrs';
import { RegisterUserResponse } from './register-user.types';

class RegisterUserCommand extends Command<RegisterUserResponse> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

export { RegisterUserCommand };
