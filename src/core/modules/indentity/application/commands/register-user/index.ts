import { commandBus } from '@/core/shared/infrastructure';
import { _repo, _eventBus, _passwordHasher, _idGenerator } from '../../../_deps';
import { RegisterUserCommand } from './register-user.command';
import { RegisterUserHandler } from './register-user.handler';

commandBus.register(
  RegisterUserCommand,
  new RegisterUserHandler(_repo, _eventBus, _passwordHasher, _idGenerator),
);

export { RegisterUserCommand };
export type { RegisterUserResponse, RegisterUserResponseData } from './register-user.command';
