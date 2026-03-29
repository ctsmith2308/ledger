import { Result } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import { type IUserRepository } from '../domain';

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
    private readonly userRepository: IUserRepository,
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

  async cleanupExpiredTrials(cutoffHours: number) {
    const cutoff = new Date(Date.now() - cutoffHours * 60 * 60 * 1000);
    const expired = await this.userRepository.findExpiredTrialUsers(cutoff);

    let deleted = 0;

    for (const user of expired) {
      const result = await this.commandBus.dispatch(
        new DeleteAccountCommand(user.id.value),
      );

      if (result.isSuccess) deleted++;
    }

    return { deleted, total: expired.length };
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
