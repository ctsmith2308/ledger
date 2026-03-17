import { v4 as uuid } from 'uuid';
import { IIdGenerator } from '../../domain';

class UuIdV4IdGenerator implements IIdGenerator {
  generate(): string {
    return uuid();
  }
}

export { UuIdV4IdGenerator };
