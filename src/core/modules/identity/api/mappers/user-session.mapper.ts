import { UserSession } from '@/core/modules/identity/domain';
import { SessionDTO } from '../identity.dto';

const UserSessionMapper = {
  toDTO(session: UserSession): SessionDTO {
    return {
      sessionId: session.id.value,
      userId: session.userId.value,
      tier: session.tier.value,
    };
  },
};

export { UserSessionMapper };
