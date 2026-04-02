import { UserProfileModel } from '@generated-prisma/models/UserProfile';
import { UserProfile } from '@/core/modules/identity/domain/aggregates';

import { UserId, FirstName, LastName } from '@/core/modules/identity/domain';

const UserProfilePrismaMapper = {
  toDomain(raw: UserProfileModel) {
    const id = UserId.from(raw.userId);
    const firstName = FirstName.from(raw.firstName);
    const lastName = LastName.from(raw.lastName);

    return UserProfile.reconstitute(id, firstName, lastName);
  },

  toPersistence(userProfile: UserProfile) {
    return {
      userId: userProfile.id.value,
      firstName: userProfile.firstName.value,
      lastName: userProfile.lastName.value,
    };
  },
};

export { UserProfilePrismaMapper };
