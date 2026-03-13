import { User } from '@/modules/identity/domain';

class UserMapper {
  static toResponse(entity: User) {
    return {
      id: entity.id.value,
      email: entity.email.address,
    };
  }
}

export { UserMapper };
