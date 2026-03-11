import { Inject } from '@nestjs/common';
import { type ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';

import { DomainEvent } from '@/shared/domain';

import {
  IUserRepository,
  IPasswordHasher,
  USER_REPOSITORY,
  PASSWORD_HASHER,
  User,
  Password,
  Email,
} from '@/modules/identity/domain';
import { RegisterUserCommand } from '@/modules/identity/application';

@CommandHandler(RegisterUserCommand)
class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ id: string }> {
    const email = Email.create(command.email);

    const existing = await this.userRepository.findByEmail(email);

    if (existing) throw new Error('Email already registered');

    const plainPassword = Password.create(command.password);

    const hashString = await this.hasher.hash(plainPassword.value);

    const passwordHash = Password.fromHash(hashString);

    const user = User.register(email, passwordHash);

    await this.userRepository.save(user);

    const events = user.pullDomainEvents();

    events.forEach((event: DomainEvent) => {
      this.eventBus.publish(event);
    });

    return { id: user.id };
  }
}

export { RegisterUserHandler };
