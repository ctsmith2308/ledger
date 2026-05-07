import {
  IHandler,
  IEventBus,
  Result,
  ValidationException,
} from '@/core/shared/domain';

import {
  IPasswordHasher,
  IIdGenerator,
  IUserRepository,
  IUserProfileRepository,
  Email,
  Password,
  UserId,
  FirstName,
  LastName,
  User,
  UserProfile,
} from '@/core/modules/identity/domain';

import {
  RegisterUserCommand,
  RegisterUserResponse,
} from './register-user.command';

/**
 * Registers a new user with email, password, and profile data.
 *
 * Anti-enumeration: if the email already exists, returns Result.ok with
 * PENDING_VERIFICATION instead of failing. The caller cannot distinguish
 * "new account created" from "email already taken" based on the response.
 *
 * Event ownership: only User.register() raises UserRegisteredEvent. The
 * UserProfile is saved separately without firing its own creation event
 * because profile creation is a side effect of registration, not a
 * standalone domain occurrence.
 */
class RegisterUserHandler implements IHandler<
  RegisterUserCommand,
  RegisterUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly eventBus: IEventBus,
    private readonly hasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResponse> {
    const firstNameResult = FirstName.create(command.firstName);
    if (firstNameResult.isFailure)
      return Result.fail(
        new ValidationException(firstNameResult.error.message),
      );
    const firstName = firstNameResult.value;

    const lastNameResult = LastName.create(command.lastName);
    if (lastNameResult.isFailure)
      return Result.fail(new ValidationException(lastNameResult.error.message));
    const lastName = lastNameResult.value;

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

    const userId = UserId.from(this.idGenerator.generate());

    const user = User.register(userId, email, passwordHash);

    await this.userRepository.save(user);

    const profile = UserProfile.save(userId, firstName, lastName);

    await this.userProfileRepository.save(profile);

    const events = user.pullDomainEvents();

    await this.eventBus.dispatch(events);

    return Result.ok({ type: 'SUCCESS', user });
  }
}

export { RegisterUserHandler };
