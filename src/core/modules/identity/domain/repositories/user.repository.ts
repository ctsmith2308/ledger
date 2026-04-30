import { User } from '../aggregates';

import { UserId, Email } from '../value-objects';

/**
 * Repository interface (DDD). Defines persistence operations in domain
 * terms, not ORM terms. The domain layer depends on this interface;
 * the implementation (UserRepository in infrastructure/) depends on
 * Prisma. This inversion means the domain can be tested without a
 * database by passing a mock that satisfies this contract.
 *
 * Methods are shaped around domain queries (findByEmail, findExpiredTrialUsers),
 * not generic CRUD. Each repository interface lives in its module's
 * domain layer alongside the aggregate it persists.
 */
interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  deleteById(id: UserId): Promise<void>;
  findExpiredTrialUsers(cutoff: Date): Promise<User[]>;
}

export { type IUserRepository };
