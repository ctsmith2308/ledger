import { UserSession } from '../aggregates';

import { SessionId, UserId } from '../value-objects';

interface IUserSessionRepository {
  save(session: UserSession): Promise<void>;
  findById(id: SessionId): Promise<UserSession | null>;
  revokeById(id: SessionId): Promise<void>;
  revokeAllForUser(userId: UserId): Promise<void>;
}

export { type IUserSessionRepository };
