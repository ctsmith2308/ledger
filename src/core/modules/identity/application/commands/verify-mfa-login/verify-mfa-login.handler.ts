import {
  IHandler,
  IEventBus,
  IIdGenerator,
  InvalidMfaCodeException,
  UserNotFoundException,
  Result,
} from '@/core/shared/domain';

import {
  IUserRepository,
  IUserSessionRepository,
  ITotpService,
  UserSession,
  SessionId,
  UserId,
} from '@/core/modules/identity/domain';

import {
  VerifyMfaLoginCommand,
  VerifyMfaLoginResponse,
} from './verify-mfa-login.command';

/**
 * Completes the second step of the MFA login flow. Verifies the TOTP
 * code against the user's stored secret, creates a UserSession in
 * Postgres, and dispatches UserLoggedInEvent.
 *
 * The session ID is returned to the service layer for JWT signing
 * and inclusion in the response DTO.
 */
class VerifyMfaLoginHandler implements IHandler<
  VerifyMfaLoginCommand,
  VerifyMfaLoginResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: IUserSessionRepository,
    private readonly eventBus: IEventBus,
    private readonly totpService: ITotpService,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(
    command: VerifyMfaLoginCommand,
  ): Promise<VerifyMfaLoginResponse> {
    const userId = UserId.from(command.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) return Result.fail(new UserNotFoundException());

    if (!user.mfaSecret) {
      return Result.fail(new InvalidMfaCodeException());
    }

    const isValid = this.totpService.verify(user.mfaSecret, command.totpCode);

    if (!isValid) return Result.fail(new InvalidMfaCodeException());

    user.loggedIn();

    const sessionId = SessionId.from(this.idGenerator.generate());
    const session = UserSession.create(sessionId, UserId.from(user.id.value));
    await this.sessionRepository.save(session);

    const events = user.pullDomainEvents();
    await this.eventBus.dispatch(events);

    return Result.ok({ type: 'SUCCESS' as const, user, sessionId: sessionId.value });
  }
}

export { VerifyMfaLoginHandler };
