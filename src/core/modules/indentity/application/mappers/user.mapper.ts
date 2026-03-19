import { User } from '../../domain/aggregates';

interface UserDTO {
  id: string;
  message: string;
}

class UserMapper {
  static toResponseDTO(user: User): UserDTO {
    return {
      id: user.id.value,
      message: 'User registered. Please log in to set up MFA.',
    };
  }
}

export { UserMapper, type UserDTO };
