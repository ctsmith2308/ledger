import {
  IHandler,
  IEventBus,
  InvalidEmailException,
  InvalidPasswordException,
  Result,
} from '@/core/shared/domain';

import {
  Email,
  IPasswordHasher,
  IIdGenerator,
  IUserRepository,
  IUserSessionRepository,
  Password,
  SessionId,
  UserLoggedInEvent,
  UserSession,
} from '@/core/modules/identity/domain';

import { LoginUserCommand, LoginUserResponse } from './login-user.command';

class LoginUserHandler implements IHandler<
  LoginUserCommand,
  LoginUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: IUserSessionRepository,
    private readonly eventBus: IEventBus,
    private readonly hasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error);
    const email = emailResult.value;

    const passwordResult = Password.create(command.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.error);
    const plainPassword = passwordResult.value.content;

    const user = await this.userRepository.findByEmail(email);
    if (!user) return Result.fail(new InvalidEmailException());

    const passwordMatch = await this.hasher.verify(
      user.passwordHash.content,
      plainPassword,
    );

    if (!passwordMatch) return Result.fail(new InvalidPasswordException());

    const sessionIdResult = SessionId.create(this.idGenerator.generate());
    if (sessionIdResult.isFailure) return Result.fail(sessionIdResult.error);
    const sessionId = sessionIdResult.value;

    const session = UserSession.create(sessionId, user.id);

    await this.sessionRepository.save(session);

    await this.eventBus.dispatch([
      new UserLoggedInEvent(user.id.value, user.email.value),
    ]);

    return Result.ok(session);
  }
}

export { LoginUserHandler };
