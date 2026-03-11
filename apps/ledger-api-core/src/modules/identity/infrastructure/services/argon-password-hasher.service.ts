// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
import argon2id from 'argon2';

import type { IPasswordHasher } from '@/modules/identity/domain';

class ArgonPasswordHasher implements IPasswordHasher {
  async hash(password: string) {
    return argon2id.hash(password, { hashLength: 50 });
  }
}

export { ArgonPasswordHasher };
