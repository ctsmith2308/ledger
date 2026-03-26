import { Command, DomainException, Result } from '@/core/shared/domain';

type SyncTransactionsResult = {
  added: number;
  modified: number;
  removed: number;
};

type SyncTransactionsResponse = Result<
  SyncTransactionsResult,
  DomainException
>;

class SyncTransactionsCommand extends Command<SyncTransactionsResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export {
  SyncTransactionsCommand,
  type SyncTransactionsResponse,
  type SyncTransactionsResult,
};
