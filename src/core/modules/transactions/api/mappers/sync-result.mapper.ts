import { type SyncTransactionsResult } from '../../application';

import { type SyncResultDTO } from '../transactions.dto';

const SyncResultMapper = {
  toDTO(data: SyncTransactionsResult): SyncResultDTO {
    return {
      added: data.added,
      modified: data.modified,
      removed: data.removed,
    };
  },
};

export { SyncResultMapper };
