import { Command, DomainException, Result } from '@/core/shared/domain';

import { User } from '@/core/modules/identity/domain';

type VerifyMfaSetupResponse = Result<User, DomainException>;

class VerifyMfaSetupCommand extends Command<VerifyMfaSetupResponse> {
  constructor(
    readonly userId: string,
    readonly totpCode: string,
  ) {
    super();
  }
}

export { VerifyMfaSetupCommand, type VerifyMfaSetupResponse };
