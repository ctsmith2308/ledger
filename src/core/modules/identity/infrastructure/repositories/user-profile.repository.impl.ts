import { PrismaService } from '@/core/shared/infrastructure';
import { UserId, UserProfile, IUserProfileRepository } from '@/core/modules/identity/domain';
import { UserProfilePrismaMapper } from '../mappers/user-profile-prisma.mapper';

class UserProfileRepository implements IUserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(userProfile: UserProfile): Promise<void> {
    const data = UserProfilePrismaMapper.toPersistence(userProfile);

    await this.prisma.userProfile.upsert({
      where: { userId: userProfile.id.value },
      update: data,
      create: data,
    });
  }

  async findById(id: UserId): Promise<UserProfile | null> {
    const record = await this.prisma.userProfile.findUnique({
      where: { userId: id.value },
    });

    return record ? UserProfilePrismaMapper.toDomain(record) : null;
  }
}

export { UserProfileRepository };
