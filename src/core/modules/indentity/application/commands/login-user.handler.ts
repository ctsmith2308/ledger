import { IHandler } from '@/core/shared/domain';
import { LoginUserCommand, LoginUserResponseData } from './login-user.command';

class LoginUserHandler implements IHandler<
  LoginUserCommand,
  LoginUserResponseData
> {
  async execute(command: LoginUserCommand): Promise<LoginUserResponseData> {
    console.log({ command });
    return new Promise((res) => {
      setTimeout(() => {
        res({ jwt: 'some jwt token' });
      }, 3000);
    });
  }
}

export { LoginUserHandler };
