import { prisma } from '@/core/shared/infrastructure/persistence';
import { createAction } from '@/core/shared/infrastructure/utils';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { ArgonPasswordHasher } from '../../infrastructure/services/argon-password-hasher.service';
import { UuIdV4IdGenerator } from '../../infrastructure/services/uuidv4-id-generator.service';
import { RegisterUserHandler } from '../../application/commands/register-user.handler';
import { RegisterUserValidator } from '../../application/schema';
import {
  RegisterUserCommand,
  RegisterUserResponseData,
} from '../../application/commands/register-user.command';

const repo = new UserRepository(prisma);
const hasher = new ArgonPasswordHasher();
const idGenerator = new UuIdV4IdGenerator();
const handler = new RegisterUserHandler(repo, hasher, idGenerator);

const registerUserAction = createAction<RegisterUserCommand, RegisterUserResponseData>(
  handler,
  RegisterUserValidator(),
);

export { registerUserAction };
