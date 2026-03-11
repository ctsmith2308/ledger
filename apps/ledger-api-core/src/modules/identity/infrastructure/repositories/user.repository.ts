import { Injectable } from '@nestjs/common';
import { type IUserRepository, User, Email } from '@/modules/identity/domain';
import { UserPrismaMapper } from '@/modules/identity/infrastructure/persistence';
import { PrismaService } from '@/shared/infrastructure/persistence';

@Injectable()
class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const data = UserPrismaMapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id.value },
      update: data,
      create: data,
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    return record ? UserPrismaMapper.toDomain(record) : null;
  }
}

export { UserRepository };
