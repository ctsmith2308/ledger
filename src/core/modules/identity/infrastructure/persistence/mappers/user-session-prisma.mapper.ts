import { UserSessionModel } from '@generated-prisma/models/UserSession';
import { UserSession } from '@/core/modules/identity/domain/aggregates';
import { SessionId, UserId, UserTier } from '@/core/modules/identity/domain';

const UserSessionPrismaMapper = {
  toDomain(raw: UserSessionModel): UserSession {
    return UserSession.reconstitute(
      SessionId.from(raw.id),
      UserId.from(raw.userId),
      UserTier.from(raw.tier),
      raw.expiresAt,
      raw.revokedAt ?? undefined,
      raw.createdAt,
    );
  },

  toPersistence(session: UserSession) {
    return {
      id: session.id.value,
      userId: session.userId.value,
      tier: session.tier.value,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt ?? null,
      createdAt: session.createdAt,
    };
  },
};

export { UserSessionPrismaMapper };
