import { Command } from '@nestjs/cqrs';

class RegisterUserCommand extends Command<{ id: string }> {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {
    super();
  }
}

export { RegisterUserCommand };
