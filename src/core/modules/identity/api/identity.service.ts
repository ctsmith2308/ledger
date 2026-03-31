import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  RegisterUserCommand,
  LoginUserCommand,
  LogoutUserCommand,
  UpdateUserProfileCommand,
  DeleteAccountCommand,
  CleanupExpiredTrialsCommand,
  GetUserProfileQuery,
} from '../application';

import {
  CleanupMapper,
  LoginMapper,
  UserMapper,
  UserProfileMapper,
} from './mappers';

class IdentityService {
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

    return UserMapper.toDTO(result.getValueOrThrow());
  }

  async loginUser(email: string, password: string) {
    const result = await this.commandBus.dispatch(
      new LoginUserCommand(email, password),
    );

    return LoginMapper.toDTO(result.getValueOrThrow());
  }

  async logoutUser(sessionToken: string) {
    const result = await this.commandBus.dispatch(
      new LogoutUserCommand(sessionToken),
    );

    result.getValueOrThrow();
  }

  async updateUserProfile(
    userId: string,
    firstName: string,
    lastName: string,
  ) {
    const result = await this.commandBus.dispatch(
      new UpdateUserProfileCommand(userId, firstName, lastName),
    );

    return UserProfileMapper.toDTO(result.getValueOrThrow());
  }

  async deleteAccount(userId: string) {
    const result = await this.commandBus.dispatch(
      new DeleteAccountCommand(userId),
    );

    result.getValueOrThrow();
  }

  async cleanupExpiredTrials() {
    const result = await this.commandBus.dispatch(
      new CleanupExpiredTrialsCommand(),
    );

    return CleanupMapper.toDTO(result.getValueOrThrow());
  }

  async getUserProfile(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetUserProfileQuery(userId),
    );

    return UserProfileMapper.toDTO(result.getValueOrThrow());
  }
}

export { IdentityService };
