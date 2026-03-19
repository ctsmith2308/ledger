import { JwtService } from '@/core/shared/infrastructure';
import { LoginUserHandler, RegisterUserHandler } from './application/commands';
import { UserRepository } from './infrastructure/repository';
import { IdGenerator, PasswordHasher } from './infrastructure/services';
import { prisma } from '@/core/shared/infrastructure';

const _repo = new UserRepository(prisma);

const identityModule = {
  registerUser: new RegisterUserHandler(_repo, PasswordHasher, IdGenerator),
  loginUser: new LoginUserHandler(_repo, PasswordHasher, JwtService),
};

export { identityModule };
