import {
  JwtService,
  InProcessEventBus,
  prisma,
} from '@/core/shared/infrastructure';
import { UserRepository } from './infrastructure/repository';
import { IdGenerator, PasswordHasher } from './infrastructure/services';

const _repo = new UserRepository(prisma);
const _eventBus = new InProcessEventBus();

export {
  _repo,
  _eventBus,
  PasswordHasher as _passwordHasher,
  IdGenerator as _idGenerator,
  JwtService as _jwtService,
};
