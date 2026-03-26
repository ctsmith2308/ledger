import {
  IHandler,
  Result,
  PlaidErrorException,
} from '@/core/shared/domain';
import { IPlaidClient } from '@/core/modules/banking/domain';
import {
  CreateLinkTokenCommand,
  CreateLinkTokenResponse,
} from './create-link-token.command';

class CreateLinkTokenHandler
  implements IHandler<CreateLinkTokenCommand, CreateLinkTokenResponse>
{
  constructor(private readonly plaidClient: IPlaidClient) {}

  async execute(
    command: CreateLinkTokenCommand,
  ): Promise<CreateLinkTokenResponse> {
    try {
      const { linkToken } =
        await this.plaidClient.createLinkToken(command.userId);

      return Result.ok({ linkToken });
    } catch {
      return Result.fail(new PlaidErrorException());
    }
  }
}

export { CreateLinkTokenHandler };
