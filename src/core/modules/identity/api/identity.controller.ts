import { Result } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  RegisterUserCommand,
  LoginUserCommand,
  LogoutUserCommand,
  UpdateUserProfileCommand,
  DeleteAccountCommand,
  GetUserSessionQuery,
  GetUserProfileQuery,
} from '../application';

import { UserMapper, UserSessionMapper, UserProfileMapper } from './mappers';

class IdentityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    const result = await this.commandBus.dispatch(
      new RegisterUserCommand(firstName, lastName, email, password),
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

  async logoutUser(sessionToken: string) {
    return this.commandBus.dispatch(
      new LogoutUserCommand(sessionToken),
    );
  }

  async getUserSession(token: string) {
    const result = await this.queryBus.dispatch(new GetUserSessionQuery(token));

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(UserSessionMapper.toDTO(result.value));
  }

  async updateUserProfile(
    userId: string,
    firstName: string,
    lastName: string,
  ) {
    const result = await this.commandBus.dispatch(
      new UpdateUserProfileCommand(userId, firstName, lastName),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(UserProfileMapper.toDTO(result.value));
  }

  async deleteAccount(userId: string) {
    return this.commandBus.dispatch(new DeleteAccountCommand(userId));
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
