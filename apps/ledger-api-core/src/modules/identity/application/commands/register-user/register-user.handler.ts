import { Inject } from '@nestjs/common';
import { type ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';

import { DomainEvent } from '@/shared/domain';

import {
  IUserRepository,
  IPasswordHasher,
  IIdGenerator,
  USER_REPOSITORY,
  PASSWORD_HASHER,
  ID_GENERATOR,
  User,
  UserId,
  Password,
  Email,
} from '@/modules/identity/domain';
import { RegisterUserCommand } from '@/modules/identity/application';

@CommandHandler(RegisterUserCommand)
class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(ID_GENERATOR) private readonly idGenerator: IIdGenerator,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<{ id: string }> {
    const email = Email.create(command.email);

    const existing = await this.userRepository.findByEmail(email);

    if (existing) throw new Error('Email already registered');

    const plainPassword = Password.create(command.password);

    const hashString = await this.hasher.hash(plainPassword.value);

    const passwordHash = Password.fromHash(hashString);

    const rawId = this.idGenerator.generate();

    const userId = UserId.create(rawId);

    const user = User.register(userId, email, passwordHash);

    await this.userRepository.save(user);

    const events = user.pullDomainEvents();

    events.forEach((event: DomainEvent) => {
      this.eventBus.publish(event);
    });

    return { id: user.id.value };
  }
}

export { RegisterUserHandler };
