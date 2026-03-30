import { Result } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  RegisterUserCommand,
  LoginUserCommand,
  LogoutUserCommand,
  UpdateUserProfileCommand,
  DeleteAccountCommand,
  CleanupExpiredTrialsCommand,
  GetUserSessionQuery,
  GetUserProfileQuery,
} from '../application';

import {
  CleanupMapper,
  LoginMapper,
  UserMapper,
  UserProfileMapper,
} from './mappers';

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
      : Result.ok(LoginMapper.toDTO(result.value));
  }

  async logoutUser(sessionToken: string) {
    return this.commandBus.dispatch(
      new LogoutUserCommand(sessionToken),
    );
  }

  // TODO: Refresh flow — GetUserSessionHandler needs IJwtService dep to sign
  // a new access token. Handler should return LoginTokens, controller maps
  // through LoginMapper.toDTO() — same output as loginUser.
  async getUserSession(token: string) {
    const result = await this.queryBus.dispatch(
      new GetUserSessionQuery(token),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(result.value);
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
    const result = await this.commandBus.dispatch(
      new DeleteAccountCommand(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(undefined);
  }

  async cleanupExpiredTrials() {
    const result = await this.commandBus.dispatch(
      new CleanupExpiredTrialsCommand(),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(CleanupMapper.toDTO(result.value));
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
