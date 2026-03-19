import { JwtService } from '@/core/shared/infrastructure';
import { LoginUserHandler } from './application/commands/login-user.handler';
import { RegisterUserHandler } from './application/commands/register-user.handler';
import { UserRepository } from './infrastructure/repository/user.repository';
import { IdGenerator, PasswordHasher } from './infrastructure/services';
import { prisma } from '@/core/shared/infrastructure/persistence';

const _repo = new UserRepository(prisma);

const identityModule = {
  registerUser: new RegisterUserHandler(_repo, PasswordHasher, IdGenerator),
  loginUser: new LoginUserHandler(_repo, PasswordHasher, JwtService),
};

export { identityModule };
