import { IHandler, Result } from '@/core/shared/domain';
import {
  IPasswordHasher,
  IIdGenerator,
  Email,
  Password,
  UserId,
} from '../../domain';
import { User } from '../../domain/aggregates';
import { IUserRepository } from '../../domain/repositories';
import {
  RegisterUserCommand,
  RegisterUserResponse,
} from './register-user.command';
import { UserMapper } from '../mappers/user.mapper';

class RegisterUserHandler implements IHandler<RegisterUserCommand, RegisterUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
    // private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    // 1. Validate Email (Domain)
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error);
    const email = emailResult.value;

    // 2. Check Uniqueness (Application/Security)
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      // Return success to prevent enumeration
      return Result.ok({
        type: 'PENDING_VERIFICATION',
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

    // 5. Domain Logic
    const user = User.register(userId, email, passwordHash);

    // 6. Persistence
    await this.userRepository.save(user);

    // 7. Side Effects
    // const events = user.pullDomainEvents();
    // events.forEach((event: DomainEvent) => this.eventBus.publish(event));
    const reponseDto = UserMapper.toResponseDTO(user);

    // 8. Mapped Output
    return Result.ok({ type: 'SUCCESS', ...reponseDto });
  }
}

export { RegisterUserHandler };
