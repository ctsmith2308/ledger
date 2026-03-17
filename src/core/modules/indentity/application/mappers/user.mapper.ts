import { User } from '../../domain/aggregates';

interface UserDTO {
  id: string;
}

class UserMapper {
  static toResponseDTO(user: User): UserDTO {
    return {
      id: user.id.value,
    };
  }
}

export { UserMapper, type UserDTO };
