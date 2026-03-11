import { User } from '@/modules/identity/domain/aggregates';
import { Email } from '@/modules/identity/domain/value-objects';

const USER_REPOSITORY = Symbol('IUserRepository');

interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
}

export { type IUserRepository, USER_REPOSITORY };
