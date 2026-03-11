import { User } from '@/modules/identity/domain';

class UserMapper {
  static toResponse(entity: User) {
    return {
      id: entity.id,
      email: entity.email,
      // Createdat needed???
    };
  }
}

export { UserMapper };
