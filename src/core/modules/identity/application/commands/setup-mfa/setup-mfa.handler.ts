import {
  IHandler,
  Result,
  UserNotFoundException,
} from '@/core/shared/domain';

import {
  IUserRepository,
  ITotpService,
  UserId,
} from '@/core/modules/identity/domain';

import { SetupMfaCommand, SetupMfaResponse } from './setup-mfa.command';

class SetupMfaHandler
  implements IHandler<SetupMfaCommand, SetupMfaResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly totpService: ITotpService,
  ) {}

  async execute(command: SetupMfaCommand): Promise<SetupMfaResponse> {
    const userId = UserId.from(command.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) return Result.fail(new UserNotFoundException());

    const secret = this.totpService.generateSecret();
    user.setMfaSecret(secret);
    await this.userRepository.save(user);

    const qrCodeDataUrl = await this.totpService.generateQrDataUrl(
      secret,
      user.email.value,
    );

    return Result.ok({ qrCodeDataUrl });
  }
}

export { SetupMfaHandler };
