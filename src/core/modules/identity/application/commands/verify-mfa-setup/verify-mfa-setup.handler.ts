import {
  IHandler,
  IEventBus,
  Result,
  UserNotFoundException,
  InvalidMfaCodeException,
} from '@/core/shared/domain';

import {
  IUserRepository,
  ITotpService,
  UserId,
} from '@/core/modules/identity/domain';

import {
  VerifyMfaSetupCommand,
  VerifyMfaSetupResponse,
} from './verify-mfa-setup.command';

class VerifyMfaSetupHandler implements IHandler<
  VerifyMfaSetupCommand,
  VerifyMfaSetupResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly totpService: ITotpService,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(
    command: VerifyMfaSetupCommand,
  ): Promise<VerifyMfaSetupResponse> {
    const userId = UserId.from(command.userId);

    const user = await this.userRepository.findById(userId);

    if (!user) return Result.fail(new UserNotFoundException());

    if (!user.mfaSecret || user.mfaEnabled) {
      return Result.fail(new InvalidMfaCodeException());
    }

    const isValid = this.totpService.verify(user.mfaSecret, command.totpCode);

    if (!isValid) return Result.fail(new InvalidMfaCodeException());

    user.confirmMfa();
    await this.userRepository.save(user);

    const events = user.pullDomainEvents();
    await this.eventBus.dispatch(events);

    return Result.ok(user);
  }
}

export { VerifyMfaSetupHandler };
