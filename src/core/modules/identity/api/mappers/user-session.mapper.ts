import { UserSession } from '../../domain/aggregates';

type SessionDTO = {
  sessionId: string;
  userId: string;
};

const UserSessionMapper = {
  toDTO(session: UserSession): SessionDTO {
    return {
      sessionId: session.id.value,
      userId: session.userId.value,
    };
  },
};

export { UserSessionMapper, type SessionDTO };
