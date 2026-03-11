import { User, Email } from '@/modules/identity/domain';

const USER_REPOSITORY = Symbol('IUserRepository');

interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
}

export { type IUserRepository, USER_REPOSITORY };
