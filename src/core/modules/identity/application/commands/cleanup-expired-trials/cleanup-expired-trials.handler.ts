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

/** Default 48 hours. Configurable via TRIAL_TTL_HOURS env var. */
const TRIAL_TTL_HOURS = Number(process.env.TRIAL_TTL_HOURS ?? 48);

/**
 * Deletes trial users whose accounts have exceeded the TTL.
 * Designed to run on a schedule (QStash cron).
 *
 * Ordering matters: sessions are revoked before the user is deleted so
 * no dangling session records reference a deleted user.
 *
 * Handler-dispatched event: the user aggregate is being destroyed, so it
 * cannot raise its own event. The handler dispatches AccountDeletedEvent
 * directly per the handler-dispatched pattern.
 */
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
