import { Command, DomainException, Result } from '@/core/shared/domain';

type CreateLinkTokenResponse = Result<{ linkToken: string }, DomainException>;

class CreateLinkTokenCommand extends Command<CreateLinkTokenResponse> {
  static readonly type = 'CreateLinkTokenCommand';

  constructor(readonly userId: string) {
    super();
  }
}

export { CreateLinkTokenCommand, type CreateLinkTokenResponse };
