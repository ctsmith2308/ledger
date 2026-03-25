import { IHandler, IEventBus, Result } from '@/core/shared/domain';
import {
  IPasswordHasher,
  IIdGenerator,
  IUserRepository,
  Email,
  Password,
  UserId,
  User,
} from '@/core/modules/identity/domain';

import {
  RegisterUserCommand,
  RegisterUserResponse,
} from './register-user.command';

class RegisterUserHandler implements IHandler<
  RegisterUserCommand,
  RegisterUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly hasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error);
    const email = emailResult.value;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) return Result.ok({ type: 'PENDING_VERIFICATION' });

    const passwordResult = Password.create(command.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.error);
    const plainPassword = passwordResult.value;

    const hashString = await this.hasher.hash(plainPassword.content);
    const passwordHash = Password.fromHash(hashString);

    const { value: userId } = UserId.create(this.idGenerator.generate());

    const user = User.register(userId, email, passwordHash);

    await this.userRepository.save(user);

    const events = user.pullDomainEvents();

    await this.eventBus.dispatch(events);

    return Result.ok({ type: 'SUCCESS', user });
  }
}

export { RegisterUserHandler };
