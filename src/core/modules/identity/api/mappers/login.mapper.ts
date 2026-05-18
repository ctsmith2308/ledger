import { JWT_TYPE, JWT_TTL, type JwtType } from '@/core/shared/domain';

import { type LoginResult } from '../../application';

import { type LoginResponseDTO } from '../identity.dto';

type SigningParams = {
  userId: string;
  purpose: JwtType;
  ttl: string;
};

const LoginMapper = {
  toSigningParams(loginResult: LoginResult): SigningParams {
    const userId = loginResult.user.id.value;
    const isSuccess = loginResult.type === 'SUCCESS';

    return {
      userId,
      purpose: isSuccess ? JWT_TYPE.ACCESS : JWT_TYPE.MFA_CHALLENGE,
      ttl: isSuccess ? JWT_TTL.ACCESS : JWT_TTL.MFA_CHALLENGE,
    };
  },

  toDTO(type: LoginResult['type'], token: string): LoginResponseDTO {
    return { type, token };
  },
};

export { LoginMapper };
