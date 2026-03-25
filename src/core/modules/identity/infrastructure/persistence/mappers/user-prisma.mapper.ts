import { UserModel } from 'prisma/generated/prisma/models/User';
import { User } from '@/core/modules/identity/domain/aggregates';
import { UserId, Email, Password } from '@/core/modules/identity/domain';

const UserPrismaMapper = {
  toDomain(raw: UserModel): User {
    const id = UserId.from(raw.id);
    const email = Email.from(raw.email);
    const password = Password.fromHash(raw.passwordHash);

    return User.reconstitute(
      id,
      email,
      password,
      raw.mfaEnabled,
      raw.mfaSecret ?? undefined,
    );
  },

  toPersistence(user: User) {
    return {
      id: user.id.value,
      email: user.email.value,
      passwordHash: user.passwordHash.content,
      mfaEnabled: user.mfaEnabled,
      mfaSecret: user.mfaSecret ?? null,
    };
  },
};

export { UserPrismaMapper };
