import { User } from '../aggregates';
import { UserId, Email } from '../value-objects';

interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  deleteById(id: UserId): Promise<void>;
}

export { type IUserRepository };
