import { Command, DomainException, Result } from '@/core/shared/domain';
import { User } from '@/core/modules/identity/domain';

type VerifyMfaLoginResponse = Result<User, DomainException>;

class VerifyMfaLoginCommand extends Command<VerifyMfaLoginResponse> {
  constructor(
    readonly userId: string,
    readonly totpCode: string,
  ) {
    super();
  }
}

export { VerifyMfaLoginCommand, type VerifyMfaLoginResponse };
