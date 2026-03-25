import { PrismaService } from '@/core/shared/infrastructure';
import { UserId, Email, User, IUserRepository } from '@/core/modules/identity/domain';
import { UserPrismaMapper } from '../mappers/user-prisma.mapper';

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

  async findById(id: UserId): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: id.value },
    });

    return record ? UserPrismaMapper.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    return record ? UserPrismaMapper.toDomain(record) : null;
  }
}

export { UserRepository };
