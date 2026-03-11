import { Provider } from '@nestjs/common';

// Domain
import {
  USER_REPOSITORY,
  ID_GENERATOR,
  PASSWORD_HASHER,
} from '@/modules/identity/domain';

// Infrastructure
import {
  UserRepository,
  UuIdV4IdGenerator,
  ArgonPasswordHasher,
} from '@/modules/identity/infrastructure';

import { RegisterUserHandler } from '@/modules/identity/application';

const IdentityApplicationProviders = [RegisterUserHandler];

/**
 * Important!
 * Providers need to be provided as per nest.js spec:
 * see: https://docs.nestjs.com/fundamentals/custom-providers#standard-providers
 * see: https://docs.nestjs.com/fundamentals/custom-providers
 */
const IdentityInfrastructureProviders: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserRepository },
  { provide: ID_GENERATOR, useClass: UuIdV4IdGenerator },
  { provide: PASSWORD_HASHER, useClass: ArgonPasswordHasher },
];

export { IdentityApplicationProviders, IdentityInfrastructureProviders };
