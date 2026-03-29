import {
  IHandler,
  IEventBus,
  Result,
  UserNotFoundException,
} from '@/core/shared/domain';
import {
  IUserRepository,
  IUserSessionRepository,
  UserId,
  AccountDeletedEvent,
} from '@/core/modules/identity/domain';

import {
  DeleteAccountCommand,
  DeleteAccountResponse,
} from './delete-account.command';

class DeleteAccountHandler
  implements IHandler<DeleteAccountCommand, DeleteAccountResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: IUserSessionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(
    command: DeleteAccountCommand,
  ): Promise<DeleteAccountResponse> {
    const userId = UserId.from(command.userId);

    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.fail(new UserNotFoundException());
    }

    await this.sessionRepository.revokeAllForUser(userId);

    await this.userRepository.deleteById(userId);

    await this.eventBus.dispatch([
      new AccountDeletedEvent(command.userId),
    ]);

    return Result.ok(undefined);
  }
}

export { DeleteAccountHandler };
