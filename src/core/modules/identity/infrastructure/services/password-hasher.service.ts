import argon2id from 'argon2';

import { IPasswordHasher } from '@/core/modules/identity/domain';

/**
 * Argon2id password hashing per OWASP recommendations.
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 *
 * hashLength 50 produces a longer output hash than the default (32).
 * Argon2 handles salt generation internally.
 */
const PasswordHasher: IPasswordHasher = {
  async hash(password: string) {
    return argon2id.hash(password, { hashLength: 50 });
  },

  async verify(hashedPassword: string, password: string): Promise<boolean> {
    return argon2id.verify(hashedPassword, password);
  },
};

export { PasswordHasher };
