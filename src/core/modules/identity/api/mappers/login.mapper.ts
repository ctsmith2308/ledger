import {
  type LoginSuccessDTO,
  type MfaChallengeDTO,
} from '../identity.dto';

const LoginMapper = {
  toSuccessDTO(token: string, sessionId: string): LoginSuccessDTO {
    return { type: 'SUCCESS', token, sessionId };
  },

  toMfaChallengeDTO(token: string): MfaChallengeDTO {
    return { type: 'MFA_REQUIRED', token };
  },
};

export { LoginMapper };
