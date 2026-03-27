import { Command, DomainException, Result } from '@/core/shared/domain';

type DeleteAccountResponse = Result<void, DomainException>;

class DeleteAccountCommand extends Command<DeleteAccountResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { DeleteAccountCommand, type DeleteAccountResponse };
