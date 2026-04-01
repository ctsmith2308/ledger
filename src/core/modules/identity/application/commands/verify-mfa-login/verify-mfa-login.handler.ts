import {
  IHandler,
  IEventBus,
  InvalidMfaCodeException,
  UserNotFoundException,
  Result,
} from '@/core/shared/domain';

import {
  IUserRepository,
  ITotpService,
  UserId,
} from '@/core/modules/identity/domain';

import {
  VerifyMfaLoginCommand,
  VerifyMfaLoginResponse,
} from './verify-mfa-login.command';

class VerifyMfaLoginHandler implements IHandler<
  VerifyMfaLoginCommand,
  VerifyMfaLoginResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
    private readonly totpService: ITotpService,
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

    const events = user.pullDomainEvents();
    await this.eventBus.dispatch(events);

    return Result.ok(user);
  }
}

export { VerifyMfaLoginHandler };
