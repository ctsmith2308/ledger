import { Command, DomainException, Result } from '@/core/shared/domain';
import { User } from '@/core/modules/identity/domain';

type DisableMfaResponse = Result<User, DomainException>;

class DisableMfaCommand extends Command<DisableMfaResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { DisableMfaCommand, type DisableMfaResponse };
