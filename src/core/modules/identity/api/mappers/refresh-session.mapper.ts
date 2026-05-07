import { type RefreshSessionDTO } from '../identity.dto';

const RefreshSessionMapper = {
  toDTO(
    accessToken: string,
    userId: string,
    sessionId: string,
  ): RefreshSessionDTO {
    return { accessToken, userId, sessionId };
  },
};

export { RefreshSessionMapper };
