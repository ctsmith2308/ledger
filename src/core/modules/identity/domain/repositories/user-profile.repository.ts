import { UserProfile } from '../aggregates';

import { UserId } from '../value-objects';

interface IUserProfileRepository {
  save(userProfile: UserProfile): Promise<void>;
  findById(id: UserId): Promise<UserProfile | null>;
}

export { type IUserProfileRepository };
