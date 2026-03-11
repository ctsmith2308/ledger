import { User as PrismaUser } from '@generated/prisma/client'; // Import the generated type from Prisma.schema.
import { User, UserId, Email, Password } from '@/modules/identity/domain';

class UserPrismaMapper {
  static toDomain(raw: PrismaUser): User {
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
  }

  static toPersistence(user: User) {
    return {
      id: user.id.value,
      email: user.email.address,
      passwordHash: user.passwordHash.content,
      mfaEnabled: user.mfaEnabled,
      mfaSecret: user.mfaSecret ?? null,
    };
  }
}

export { UserPrismaMapper };
