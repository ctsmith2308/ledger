import { Command, DomainException, Result } from '@/core/shared/domain';

import { UserSession } from '@/core/modules/identity/domain';

type RefreshSessionResponse = Result<UserSession, DomainException>;

class RefreshSessionCommand extends Command<RefreshSessionResponse> {
  static readonly type = 'RefreshSessionCommand';

  constructor(readonly sessionId: string) {
    super();
  }
}

export { RefreshSessionCommand, type RefreshSessionResponse };
