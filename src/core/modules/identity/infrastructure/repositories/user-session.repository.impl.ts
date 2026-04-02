import { PrismaService } from '@/core/shared/infrastructure';
import { SessionId, UserId, UserSession, IUserSessionRepository } from '@/core/modules/identity/domain';
import { UserSessionPrismaMapper } from '../mappers/user-session-prisma.mapper';

class UserSessionRepository implements IUserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: UserSession): Promise<void> {
    const data = UserSessionPrismaMapper.toPersistence(session);

    await this.prisma.userSession.upsert({
      where: { id: session.id.value },
      update: data,
      create: data,
    });
  }

  async findById(id: SessionId): Promise<UserSession | null> {
    const record = await this.prisma.userSession.findUnique({
      where: { id: id.value },
    });

    return record ? UserSessionPrismaMapper.toDomain(record) : null;
  }

  async revokeById(id: SessionId): Promise<void> {
    await this.prisma.userSession.update({
      where: { id: id.value },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: UserId): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId: userId.value, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export { UserSessionRepository };
