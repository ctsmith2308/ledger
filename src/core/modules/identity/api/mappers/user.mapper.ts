import { RegisterUserResult } from '@/core/modules/identity/application';
import { UserDTO } from '../identity.dto';

const UserMapper = {
  toDTO(result: RegisterUserResult): UserDTO {
    if (result.type === 'PENDING_VERIFICATION') {
      return {
        type: 'PENDING_VERIFICATION',
        message: 'Check your email to proceed.',
      };
    }

    return {
      type: 'SUCCESS',
      id: result.user.id.value,
      email: result.user.email.value,
    };
  },
};

export { UserMapper };
