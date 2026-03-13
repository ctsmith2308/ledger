import { Inject } from '@nestjs/common';
import { type ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';

import { type DomainEvent, Result } from '@/shared/domain';

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

import {
  RegisterUserCommand,
  type RegisterUserResponse,
} from './register-user.command';
import { UserMapper } from '@/modules/identity/application/mappers';

@CommandHandler(RegisterUserCommand)
class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(ID_GENERATOR) private readonly idGenerator: IIdGenerator,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    // 1. Validate Email (Domain)
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error);
    const email = emailResult.value;

    // 2. Check Uniqueness (Application/Security)
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      // Return success to prevent enumeration,
      return Result.ok({
        status: 'PENDING_VERIFICATION',
        message: 'Check your email to proceed.',
      });
    }

    // 3. Validate Password (Domain)
    const passwordResult = Password.create(command.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.error);
    const plainPassword = passwordResult.value;

    // 4. Infrastructure/Coordination
    const hashString = await this.hasher.hash(plainPassword.content);
    const passwordHash = Password.fromHash(hashString);
    const { value: userId } = UserId.create(this.idGenerator.generate());

    // 5. Domain Logic (The actual registration)
    const user = User.register(userId, email, passwordHash);

    // 6. Persistence
    await this.userRepository.save(user);

    // 7. Side Effects
    const events = user.pullDomainEvents();

    events.forEach((event: DomainEvent) => {
      this.eventBus.publish(event);
    });

    // 8. Mapped Output
    return Result.ok({
      status: 'SUCCESS',
      ...UserMapper.toResponse(user),
    });
  }
}

export { RegisterUserHandler };
