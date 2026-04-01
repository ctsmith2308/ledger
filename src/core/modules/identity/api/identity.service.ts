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
  GetUserProfileQuery,
  GetUserAccountQuery,
} from '../application';

import {
  CleanupMapper,
  UserMapper,
  UserAccountMapper,
  UserProfileMapper,
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

  async loginUser(
    email: string,
    password: string,
  ): Promise<LoginResponseDTO> {
    const result = await this.commandBus.dispatch(
      new LoginUserCommand(email, password),
    );

    const loginResult = result.getValueOrThrow();
    const userId = loginResult.user.id.value;
    const isSuccess = loginResult.type === 'SUCCESS';
    const purpose = isSuccess ? 'access' : 'mfa_challenge';
    const ttl = isSuccess ? '15m' : '5m';

    const tokenResult = await this.jwtService.sign(userId, purpose, ttl);
    const token = tokenResult.getValueOrThrow();

    return isSuccess
      ? { type: 'SUCCESS', accessToken: token }
      : { type: 'MFA_REQUIRED', challengeToken: token };
  }

  async setupMfa(userId: string) {
    const result = await this.commandBus.dispatch(
      new SetupMfaCommand(userId),
    );

    return result.getValueOrThrow();
  }

  async verifyMfaSetup(userId: string, totpCode: string) {
    const result = await this.commandBus.dispatch(
      new VerifyMfaSetupCommand(userId, totpCode),
    );

    result.getValueOrThrow();
  }

  async verifyMfaLogin(challengeToken: string, totpCode: string) {
    const verifyResult = await this.jwtService.verify(challengeToken, 'mfa_challenge');
    const userId = verifyResult.getValueOrThrow();

    const result = await this.commandBus.dispatch(
      new VerifyMfaLoginCommand(userId, totpCode),
    );

    const user = result.getValueOrThrow();
    const tokenResult = await this.jwtService.sign(user.id.value, 'access', '15m');

    return { accessToken: tokenResult.getValueOrThrow() };
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

  async getUserAccount(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetUserAccountQuery(userId),
    );

    return UserAccountMapper.toDTO(result.getValueOrThrow());
  }
}

export { IdentityService };
