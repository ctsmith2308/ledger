import { commandBus } from '@/core/shared/infrastructure';
import { _repo, _eventBus, _passwordHasher, _jwtService } from '../../../_deps';
import { LoginUserCommand } from './login-user.command';
import { LoginUserHandler } from './login-user.handler';

commandBus.register(
  LoginUserCommand,
  new LoginUserHandler(_repo, _eventBus, _passwordHasher, _jwtService),
);

export { LoginUserCommand };
export type { LoginUserResponse, LoginUserResponseData } from './login-user.command';
