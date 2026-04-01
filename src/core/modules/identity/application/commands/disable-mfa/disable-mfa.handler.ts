import {
  IHandler,
  IEventBus,
  Result,
  UserNotFoundException,
} from '@/core/shared/domain';

import {
  IUserRepository,
  UserId,
} from '@/core/modules/identity/domain';

import {
  DisableMfaCommand,
  DisableMfaResponse,
} from './disable-mfa.command';

class DisableMfaHandler
  implements IHandler<DisableMfaCommand, DisableMfaResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(command: DisableMfaCommand): Promise<DisableMfaResponse> {
    const userId = UserId.from(command.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) return Result.fail(new UserNotFoundException());

    user.disableMfa();
    await this.userRepository.save(user);

    const events = user.pullDomainEvents();
    await this.eventBus.dispatch(events);

    return Result.ok(user);
  }
}

export { DisableMfaHandler };
