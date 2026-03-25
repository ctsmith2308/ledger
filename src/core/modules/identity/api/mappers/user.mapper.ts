import { RegisterUserResult } from '../../application/commands/register-user';

type UserDTO =
  | { type: 'SUCCESS'; id: string; email: string }
  | { type: 'PENDING_VERIFICATION'; message: string };

const UserMapper = {
  toDTO(result: RegisterUserResult): UserDTO {
    if (result.type === 'PENDING_VERIFICATION') {
      return { type: 'PENDING_VERIFICATION', message: 'Check your email to proceed.' };
    }

    return {
      type: 'SUCCESS',
      id: result.user.id.value,
      email: result.user.email.value,
    };
  },
};

export { UserMapper, type UserDTO };
