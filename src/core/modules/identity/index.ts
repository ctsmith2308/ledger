import {
  commandBus,
  queryBus,
  eventBus,
  prisma,
  JwtService,
} from '@/core/shared/infrastructure';

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
  GetUserSessionQuery,
  GetUserSessionHandler,
  GetUserProfileQuery,
  GetUserProfileHandler,
} from './application';

import {
  UserRepository,
  UserSessionRepository,
  UserProfileRepository,
  PasswordHasher,
  IdGenerator,
} from './infrastructure';

import { IdentityController } from './api';

class IdentityModule {
  private constructor() {}

  static init(): IdentityController {
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
        JwtService,
      ),
    );

    commandBus.register(
      LogoutUserCommand,
      new LogoutUserHandler(repos.userSessionRepository, services.eventBus),
    );

    commandBus.register(
      UpdateUserProfileCommand,
      new UpdateUserProfileHandler(repos.userProfileRepository, services.eventBus),
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

    queryBus.register(
      GetUserSessionQuery,
      new GetUserSessionHandler(repos.userSessionRepository),
    );

    queryBus.register(
      GetUserProfileQuery,
      new GetUserProfileHandler(repos.userProfileRepository),
    );

    return new IdentityController(commandBus, queryBus);
  }
}

const identityController = IdentityModule.init();

export { identityController };

export * from './api';
