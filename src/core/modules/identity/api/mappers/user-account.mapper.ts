import { User, UserProfile } from '@/core/modules/identity/domain';

import { type UserAccountDTO } from '../identity.dto';

type UserAccountMapperInput = {
  user: User;
  profile: UserProfile;
  features: string[];
};

const UserAccountMapper = {
  toDTO(data: UserAccountMapperInput): UserAccountDTO {
    return {
      email: data.user.email.value,
      tier: data.user.tier.value,
      mfaEnabled: data.user.mfaEnabled,
      firstName: data.profile.firstName.value,
      lastName: data.profile.lastName.value,
      features: data.features,
    };
  },
};

export { UserAccountMapper };
