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

class RegisterUserHandler implements IHandler<
  RegisterUserCommand,
  RegisterUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
    // private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error);
    const email = emailResult.value;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return Result.ok({
        type: 'PENDING_VERIFICATION',
        message: 'Check your email to proceed.',
      });
    }

    const passwordResult = Password.create(command.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.error);
    const plainPassword = passwordResult.value;

    const hashString = await this.hasher.hash(plainPassword.content);
    const passwordHash = Password.fromHash(hashString);

    const { value: userId } = UserId.create(this.idGenerator.generate());

    const user = User.register(userId, email, passwordHash);

    await this.userRepository.save(user);

    const reponseDto = UserMapper.toResponseDTO(user);

    return Result.ok({ type: 'SUCCESS', ...reponseDto });
  }
}

export { RegisterUserHandler };
