import {
  commandBus,
  queryBus,
  eventBus,
  prisma,
  featureFlagRepo,
} from '@/core/shared/infrastructure';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

import {
  RegisterUserCommand,
  RegisterUserHandler,
  LoginUserCommand,
  LoginUserHandler,
  LogoutUserCommand,
  LogoutUserHandler,
  UpdateUserProfileCommand,
  UpdateUserProfileHandler,
  DeleteAccountCommand,
  DeleteAccountHandler,
  CleanupExpiredTrialsCommand,
  CleanupExpiredTrialsHandler,
  SetupMfaCommand,
  SetupMfaHandler,
  VerifyMfaSetupCommand,
  VerifyMfaSetupHandler,
  VerifyMfaLoginCommand,
  VerifyMfaLoginHandler,
  DisableMfaCommand,
  DisableMfaHandler,
  RefreshSessionCommand,
  RefreshSessionHandler,
  GetUserAccountQuery,
  GetUserAccountHandler,
} from '../application';

import {
  UserRepository,
  UserSessionRepository,
  UserProfileRepository,
  PasswordHasher,
  IdGenerator,
  TotpService,
} from '../infrastructure';

import { IdentityService } from './identity.service';

class IdentityModule {
  private constructor() {}

  static init(): IdentityService {
    const repos = {
      userRepository: new UserRepository(prisma),
      userSessionRepository: new UserSessionRepository(prisma),
      userProfileRepository: new UserProfileRepository(prisma),
    };

    const services = {
      passwordHasher: PasswordHasher,
      idGenerator: IdGenerator,
      eventBus,
    };

    commandBus.register(
      RegisterUserCommand,
      new RegisterUserHandler(
        repos.userRepository,
        repos.userProfileRepository,
        services.eventBus,
        services.passwordHasher,
        services.idGenerator,
      ),
    );

    commandBus.register(
      LoginUserCommand,
      new LoginUserHandler(
        repos.userRepository,
        repos.userSessionRepository,
        services.eventBus,
        services.passwordHasher,
        services.idGenerator,
      ),
    );

    commandBus.register(
      LogoutUserCommand,
      new LogoutUserHandler(repos.userSessionRepository, services.eventBus),
    );

    commandBus.register(
      UpdateUserProfileCommand,
      new UpdateUserProfileHandler(
        repos.userProfileRepository,
        services.eventBus,
      ),
    );

    commandBus.register(
      DeleteAccountCommand,
      new DeleteAccountHandler(
        repos.userRepository,
        repos.userSessionRepository,
        services.eventBus,
      ),
    );

    commandBus.register(
      CleanupExpiredTrialsCommand,
      new CleanupExpiredTrialsHandler(
        repos.userRepository,
        repos.userSessionRepository,
        services.eventBus,
      ),
    );

    commandBus.register(
      SetupMfaCommand,
      new SetupMfaHandler(repos.userRepository, TotpService),
    );

    commandBus.register(
      VerifyMfaSetupCommand,
      new VerifyMfaSetupHandler(
        repos.userRepository,
        TotpService,
        services.eventBus,
      ),
    );

    commandBus.register(
      VerifyMfaLoginCommand,
      new VerifyMfaLoginHandler(
        repos.userRepository,
        repos.userSessionRepository,
        services.eventBus,
        TotpService,
        services.idGenerator,
      ),
    );

    commandBus.register(
      DisableMfaCommand,
      new DisableMfaHandler(repos.userRepository, services.eventBus),
    );

    commandBus.register(
      RefreshSessionCommand,
      new RefreshSessionHandler(repos.userSessionRepository),
    );

    queryBus.register(
      GetUserAccountQuery,
      new GetUserAccountHandler(
        repos.userRepository,
        repos.userProfileRepository,
        featureFlagRepo,
      ),
    );

    return new IdentityService(commandBus, queryBus, JwtService);
  }
}

const identityService = IdentityModule.init();

export { identityService, type IdentityService };
export * from './identity.dto';
