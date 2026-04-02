import { Command, DomainException, Result } from '@/core/shared/domain';

type SetupMfaResult = { qrCodeDataUrl: string };
type SetupMfaResponse = Result<SetupMfaResult, DomainException>;

class SetupMfaCommand extends Command<SetupMfaResponse> {
  static readonly type = 'SetupMfaCommand';

  constructor(readonly userId: string) {
    super();
  }
}

export { SetupMfaCommand, type SetupMfaResponse, type SetupMfaResult };
