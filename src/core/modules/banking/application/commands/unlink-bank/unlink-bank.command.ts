import { Command, DomainException, Result } from '@/core/shared/domain';

type UnlinkBankResponse = Result<void, DomainException>;

class UnlinkBankCommand extends Command<UnlinkBankResponse> {
  static readonly type = 'UnlinkBankCommand';

  constructor(
    readonly userId: string,
    readonly plaidItemId: string,
  ) {
    super();
  }
}

export { UnlinkBankCommand, type UnlinkBankResponse };
