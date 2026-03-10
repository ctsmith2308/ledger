import { User } from '@/modules/identity/domain/';

const USER_REPOSITORY = Symbol('IUserRepository');

interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export type { IUserRepository };

export { USER_REPOSITORY };
