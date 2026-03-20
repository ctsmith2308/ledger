import {
  IHandler,
  IEventBus,
  IJwtService,
  InvalidEmailException,
  InvalidPasswordException,
  Result,
} from '@/core/shared/domain';
import { Email, IPasswordHasher, Password, UserLoggedInEvent } from '../../../domain';
import { IUserRepository } from '../../../domain/repositories';
import { LoginUserCommand, LoginUserResponse } from './login-user.command';

class LoginUserHandler implements IHandler<LoginUserCommand, LoginUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus,
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

    if (signedJwt.isFailure) return Result.fail(signedJwt.error);

    await this.eventBus.dispatch([
      new UserLoggedInEvent(user.id.value, user.email.address),
    ]);

    return Result.ok({ jwt: signedJwt.value });
  }
}

export { LoginUserHandler };
