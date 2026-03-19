import { LoginUserHandler } from './application/commands/login-user.handler';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { UserRepository } from './infrastructure/repository/user.repository';
import { ArgonPasswordHasher } from './infrastructure/services/argon-password-hasher.service';
import { UuIdV4IdGenerator } from './infrastructure/services/uuidv4-id-generator.service';
import { prisma } from '@/core/shared/infrastructure/persistence';

const _repo = new UserRepository(prisma);
const _hasher = new ArgonPasswordHasher();
const _idGenerator = new UuIdV4IdGenerator();

const identityModule = {
  registerUser: new RegisterUserHandler(_repo, _hasher, _idGenerator),
  loginUser: new LoginUserHandler(),
};

export { identityModule };
