import {
  commandBus,
  queryBus,
  InProcessEventBus,
  prisma,
} from '@/core/shared/infrastructure';

import {
  RegisterUserCommand,
  RegisterUserHandler,
  LoginUserCommand,
  LoginUserHandler,
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

const IdentityModule = () => {
  const repos = {
    userRepository: new UserRepository(prisma),
    userSessionRepository: new UserSessionRepository(prisma),
    userProfileRepository: new UserProfileRepository(prisma),
  };

  const services = {
    passwordHasher: PasswordHasher,
    idGenerator: IdGenerator,
    eventBus: new InProcessEventBus(),
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

  queryBus.register(
    GetUserSessionQuery,
    new GetUserSessionHandler(repos.userSessionRepository),
  );

  queryBus.register(
    GetUserProfileQuery,
    new GetUserProfileHandler(repos.userProfileRepository),
  );

  return new IdentityController(commandBus, queryBus);
};

export { IdentityModule };

export {
  registerUserSchema,
  loginUserSchema,
  type SessionDTO,
  type UserDTO,
  type UserProfileDTO,
  type RegisterUserInput,
  type LoginUserInput,
} from './api';
