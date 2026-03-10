import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import argon2id from 'argon2';
import { v4 as uuid } from 'uuid';

import { User } from '@/modules/identity/domain/aggregates/user.aggregate';
import { RegisterUserCommand } from '@/modules/identity/cqrs';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/identity/domain';

@CommandHandler(RegisterUserCommand)
class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<string> {
    const existing = await this.userRepository.findByEmail(command.email);

    if (existing) throw new Error('Email already registered');

    const passwordHash = await argon2id.hash(command.password, {
      hashLength: 50,
    });

    const user = User.register(uuid(), command.email, passwordHash);

    await this.userRepository.save(user);

    // const events = user.pullDomainEvents();

    // events.forEach((event) => this.eventBus.publish(event));

    return user.id;
  }
}

export { RegisterUserHandler };
