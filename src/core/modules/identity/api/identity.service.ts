import { type IJwtService } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  RegisterUserCommand,
  LoginUserCommand,
  LogoutUserCommand,
  UpdateUserProfileCommand,
  DeleteAccountCommand,
  CleanupExpiredTrialsCommand,
  SetupMfaCommand,
  VerifyMfaSetupCommand,
  VerifyMfaLoginCommand,
  DisableMfaCommand,
  GetUserAccountQuery,
} from '../application';

import {
  CleanupMapper,
  LoginMapper,
  UserMapper,
  UserAccountMapper,
} from './mappers';

import { type LoginResponseDTO } from './identity.dto';

class IdentityService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly jwtService: IJwtService,
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

  async loginUser(email: string, password: string): Promise<LoginResponseDTO> {
    const result = await this.commandBus.dispatch(
      new LoginUserCommand(email, password),
    );

    const loginResult = result.getValueOrThrow();
    const { userId, purpose, ttl } = LoginMapper.toSigningParams(loginResult);

    const tokenResult = await this.jwtService.sign(userId, purpose, ttl);
    const token = tokenResult.getValueOrThrow();

    return LoginMapper.toDTO(loginResult.type, token);
  }

  async setupMfa(userId: string) {
    const result = await this.commandBus.dispatch(new SetupMfaCommand(userId));

    return result.getValueOrThrow();
  }

  async verifyMfaSetup(userId: string, totpCode: string) {
    const result = await this.commandBus.dispatch(
      new VerifyMfaSetupCommand(userId, totpCode),
    );

    result.getValueOrThrow();
  }

  async verifyMfaLogin(
    userId: string,
    totpCode: string,
  ): Promise<LoginResponseDTO> {
    const result = await this.commandBus.dispatch(
      new VerifyMfaLoginCommand(userId, totpCode),
    );

    const loginResult = result.getValueOrThrow();
    const { userId: mfaUserId, purpose, ttl } = LoginMapper.toSigningParams(loginResult);

    const tokenResult = await this.jwtService.sign(mfaUserId, purpose, ttl);
    const token = tokenResult.getValueOrThrow();

    return LoginMapper.toDTO(loginResult.type, token);
  }

  async disableMfa(userId: string) {
    const result = await this.commandBus.dispatch(
      new DisableMfaCommand(userId),
    );

    result.getValueOrThrow();
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
  ): Promise<void> {
    const result = await this.commandBus.dispatch(
      new UpdateUserProfileCommand(userId, firstName, lastName),
    );

    result.getValueOrThrow();
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

  async getUserAccount(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetUserAccountQuery(userId),
    );

    return UserAccountMapper.toDTO(result.getValueOrThrow());
  }
}

export { IdentityService };
