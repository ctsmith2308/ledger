import { User } from '@/modules/identity/domain/aggregates';
import { Email, UserId } from '@/modules/identity/domain/value-objects';

const USER_REPOSITORY = Symbol('IUserRepository');

interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

export { type IUserRepository, USER_REPOSITORY };
