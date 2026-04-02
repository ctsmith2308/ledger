import { UserModel } from '@generated-prisma/models/User';

import { User } from '@/core/modules/identity/domain/aggregates';

import {
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

const UserPrismaMapper = {
  toDomain(raw: UserModel): User {
    const id = UserId.from(raw.id);
    const email = Email.from(raw.email);
    const password = Password.fromHash(raw.passwordHash);
    const tier = UserTier.from(raw.tier);

    return User.reconstitute(
      id,
      email,
      password,
      tier,
      raw.mfaEnabled,
      raw.mfaSecret ?? undefined,
    );
  },

  toPersistence(user: User) {
    return {
      id: user.id.value,
      email: user.email.value,
      passwordHash: user.passwordHash.content,
      tier: user.tier.value,
      mfaEnabled: user.mfaEnabled,
      mfaSecret: user.mfaSecret ?? null,
    };
  },
};

export { UserPrismaMapper };
