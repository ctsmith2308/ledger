import { IHandler, Result, UserNotFoundException } from '@/core/shared/domain';

import {
  UserId,
  IUserRepository,
} from '@/core/modules/identity/domain';

import {
  GetUserAccountQuery,
  GetUserAccountResponse,
} from './get-user-account.query';

class GetUserAccountHandler
  implements IHandler<GetUserAccountQuery, GetUserAccountResponse>
{
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserAccountQuery): Promise<GetUserAccountResponse> {
    const userIdResult = UserId.create(query.userId);
    if (userIdResult.isFailure) return Result.fail(new UserNotFoundException());
    const userId = userIdResult.value;

    const user = await this.userRepository.findById(userId);
    if (!user) return Result.fail(new UserNotFoundException());

    return Result.ok(user);
  }
}

export { GetUserAccountHandler };
