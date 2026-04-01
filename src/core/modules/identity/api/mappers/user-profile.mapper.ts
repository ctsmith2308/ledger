import { UserProfile } from '@/core/modules/identity/domain';

import { type UserProfileDTO } from '../identity.dto';

const UserProfileMapper = {
  toDTO(profile: UserProfile): UserProfileDTO {
    return {
      userId: profile.id.value,
      firstName: profile.firstName.value,
      lastName: profile.lastName.value,
    };
  },
};

export { UserProfileMapper };
