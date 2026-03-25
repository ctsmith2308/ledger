import { Result } from '@/core/shared/domain';
import { CommandBus, QueryBus } from '@/core/shared/infrastructure';
import { RegisterUserCommand } from '../application/commands/register-user';
import { LoginUserCommand } from '../application/commands/login-user';
import { GetUserSessionQuery } from '../application/queries/get-user-session';
import { GetUserProfileQuery } from '../application/queries/get-user-profile';
import { UserMapper, UserSessionMapper, UserProfileMapper } from './mappers';

class IdentityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async registerUser(email: string, password: string) {
    const result = await this.commandBus.dispatch(
      new RegisterUserCommand(email, password),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(UserMapper.toDTO(result.value));
  }

  async loginUser(email: string, password: string) {
    const result = await this.commandBus.dispatch(
      new LoginUserCommand(email, password),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(UserSessionMapper.toDTO(result.value));
  }

  async getUserSession(token: string) {
    const result = await this.queryBus.dispatch(new GetUserSessionQuery(token));

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(UserSessionMapper.toDTO(result.value));
  }

  async getUserProfile(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetUserProfileQuery(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(UserProfileMapper.toDTO(result.value));
  }
}

export { IdentityController };
