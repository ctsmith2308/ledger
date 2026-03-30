import { type LoginTokens } from '../../application';
import { type JwtDTO } from '../identity.dto';

const LoginMapper = {
  toDTO(tokens: LoginTokens): JwtDTO {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },
};

export { LoginMapper };
