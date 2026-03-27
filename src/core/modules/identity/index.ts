import {
  commandBus,
  queryBus,
  eventBus,
  prisma,
} from '@/core/shared/infrastructure';

import {
  RegisterUserCommand,
  RegisterUserHandler,
  LoginUserCommand,
  LoginUserHandler,
  LogoutUserCommand,
  LogoutUserHandler,
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
      new LogoutUserHandler(repos.userSessionRepository),
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
