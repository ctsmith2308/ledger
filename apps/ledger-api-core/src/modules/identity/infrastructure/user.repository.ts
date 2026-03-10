import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma.service';
import { User, type IUserRepository } from '@/modules/identity/domain';

@Injectable()
class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret ?? null,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        mfaEnabled: user.mfaEnabled,
        mfaSecret: user.mfaSecret ?? null,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!record) return null;

    return User.reconstitute(
      record.id,
      record.email,
      record.passwordHash,
      record.mfaEnabled,
      record.mfaSecret ?? undefined,
    );
  }
}

export { UserRepository };
