import {
  IHandler,
  IEventBus,
  Result,
} from '@/core/shared/domain';

import {
  IUserRepository,
  IUserSessionRepository,
  AccountDeletedEvent,
} from '@/core/modules/identity/domain';

import {
  CleanupExpiredTrialsCommand,
  CleanupExpiredTrialsResponse,
} from './cleanup-expired-trials.command';

const TRIAL_TTL_HOURS = Number(process.env.TRIAL_TTL_HOURS ?? 48);

class CleanupExpiredTrialsHandler
  implements IHandler<CleanupExpiredTrialsCommand, CleanupExpiredTrialsResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: IUserSessionRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(): Promise<CleanupExpiredTrialsResponse> {
    const cutoff = new Date(
      Date.now() - TRIAL_TTL_HOURS * 60 * 60 * 1000,
    );

    const expired = await this.userRepository.findExpiredTrialUsers(cutoff);

    let deleted = 0;

    for (const user of expired) {
      await this.sessionRepository.revokeAllForUser(user.id);
      await this.userRepository.deleteById(user.id);

      await this.eventBus.dispatch([
        new AccountDeletedEvent(user.id.value),
      ]);

      deleted++;
    }

    return Result.ok({ deleted, total: expired.length });
  }
}

export { CleanupExpiredTrialsHandler };
