import { Command, DomainException, Result } from '@/core/shared/domain';

type CreateLinkTokenResponse = Result<{ linkToken: string }, DomainException>;

class CreateLinkTokenCommand extends Command<CreateLinkTokenResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { CreateLinkTokenCommand, type CreateLinkTokenResponse };
