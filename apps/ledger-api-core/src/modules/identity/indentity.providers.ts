import { Provider } from '@nestjs/common';

// Domain Repositories
import { USER_REPOSITORY } from '@/modules/identity/domain';

// Infrastructure Repositories
import { UserRepository } from '@/modules/identity/infrastructure';

const PersistenceProviders: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserRepository },
];

export { PersistenceProviders };
