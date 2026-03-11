import { User as PrismaUser } from '@generated/prisma/client'; // Import the generated type from Prisma.schema.
import { User, Email, Password } from '@/modules/identity/domain';

class UserPrismaMapper {
  static toDomain(raw: PrismaUser): User {
    const email = Email.fromValue(raw.email);
    const password = Password.fromHash(raw.passwordHash);

    return User.reconstitute(
      raw.id,
      email,
      password,
      raw.mfaEnabled,
      raw.mfaSecret ?? undefined,
    );
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.email.value,
      passwordHash: user.passwordHash.value,
      mfaEnabled: user.mfaEnabled,
      mfaSecret: user.mfaSecret ?? null,
    };
  }
}

export { UserPrismaMapper };
