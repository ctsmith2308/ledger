import { type CleanupResult } from '../../application';
import { type CleanupDTO } from '../identity.dto';

const CleanupMapper = {
  toDTO(result: CleanupResult): CleanupDTO {
    return {
      deleted: result.deleted,
      total: result.total,
    };
  },
};

export { CleanupMapper };
