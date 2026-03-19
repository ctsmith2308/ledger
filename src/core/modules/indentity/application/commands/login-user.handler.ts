import {
  IHandler,
  IJwtService,
  InvalidEmailException,
  InvalidPasswordException,
  Result,
} from '@/core/shared/domain';
import { LoginUserCommand, LoginUserResponse } from './login-user.command';
import { Email, IPasswordHasher, Password } from '../../domain';
import { IUserRepository } from '../../domain/repositories';

class LoginUserHandler implements IHandler<
  LoginUserCommand,
  LoginUserResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly jwtService: IJwtService,
  ) {}
  async execute(command: LoginUserCommand): Promise<LoginUserResponse> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) return Result.fail(emailResult.error);
    const email = emailResult.value;

    const passwordResult = Password.create(command.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.error);
    const plainPassword = passwordResult.value.content;

    const user = await this.userRepository.findByEmail(email);
    if (!user) return Result.fail(new InvalidEmailException());

    const passwordMatch = await this.hasher.verify(
      user.passwordHash.content,
      plainPassword,
    );

    if (!passwordMatch) return Result.fail(new InvalidPasswordException());

    const signedJwt = await this.jwtService.sign({
      sub: user.id.value,
      email: user.email.address,
    });

    return signedJwt.isSuccess
      ? Result.ok({ jwt: signedJwt.value })
      : Result.fail(signedJwt.error);
  }
}

export { LoginUserHandler };
