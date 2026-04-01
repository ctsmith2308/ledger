import { User } from '@/core/modules/identity/domain';

import { type UserAccountDTO } from '../identity.dto';

const UserAccountMapper = {
  toDTO(user: User): UserAccountDTO {
    return {
      email: user.email.value,
      tier: user.tier.value,
      mfaEnabled: user.mfaEnabled,
    };
  },
};

export { UserAccountMapper };
