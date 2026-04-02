import { v4 as uuid } from 'uuid';

import { IIdGenerator } from '@/core/shared/domain';

const IdGenerator: IIdGenerator = {
  generate(): string {
    return uuid();
  },
};

export { IdGenerator };
