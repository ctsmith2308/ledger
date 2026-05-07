import {
  IHandler,
  IEventBus,
  IIdGenerator,
  InvalidEmailException,
  InvalidPasswordException,
  Result,
} from '@/core/shared/domain';

import {
  Email,
  IPasswordHasher,
  IUserRepository,
  IUserSessionRepository,
  UserSession,
  SessionId,
  UserId,
  Password,
  LoginFailedEvent,
} from '@/core/modules/identity/domain';

import { LoginUserCommand, LoginUserResponse } from './login-user.command';

/**
 * Authenticates a user by email and password.
 *
 * Anti-enumeration: both "user not found" and "invalid password" dispatch
 * a LoginFailedEvent with a reason for audit, but return distinct domain
 * exceptions. The service layer maps both to the same generic external
 * error so attackers cannot distinguish the two from the response.
 *
 * MFA branching: if the user has MFA enabled, returns MFA_REQUIRED without
 * calling user.loggedIn() or creating a session. The login event and session
 * creation only fire on a full successful authentication (password + optional
 * MFA). The service layer signs a challenge token for MFA_REQUIRED and an
 * access token for SUCCESS.
 *
 * Session creation: on SUCCESS, persists a UserSession to Postgres. The
 * session ID is returned to the service layer, which includes it in the
 * response DTO for the action to set as the refresh cookie.
 */
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

    if (!user) {
      await this.eventBus.dispatch([
        new LoginFailedEvent(command.email, 'user_not_found'),
      ]);

      return Result.fail(new InvalidEmailException());
    }

    const passwordMatch = await this.hasher.verify(
      user.passwordHash.content,
      plainPassword,
    );

    if (!passwordMatch) {
      await this.eventBus.dispatch([
        new LoginFailedEvent(command.email, 'invalid_password'),
      ]);

      return Result.fail(new InvalidPasswordException());
    }

    if (user.mfaEnabled) {
      return Result.ok({ type: 'MFA_REQUIRED' as const, user });
    }

    user.loggedIn();

    const sessionId = SessionId.from(this.idGenerator.generate());
    const userId = UserId.from(user.id.value);
    const session = UserSession.create(sessionId, userId);
    await this.sessionRepository.save(session);

    const events = user.pullDomainEvents();
    await this.eventBus.dispatch(events);

    return Result.ok({
      type: 'SUCCESS' as const,
      user,
      sessionId: sessionId.value,
    });
  }
}

export { LoginUserHandler };
