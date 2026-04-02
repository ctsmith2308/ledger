import { type LinkTokenDTO } from '../banking.dto';

const LinkTokenMapper = {
  toDTO(data: { linkToken: string }): LinkTokenDTO {
    return { linkToken: data.linkToken };
  },
};

export { LinkTokenMapper };
