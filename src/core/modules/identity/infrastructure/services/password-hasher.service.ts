// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
import argon2id from 'argon2';
import { IPasswordHasher } from '@/core/modules/identity/domain';

const PasswordHasher: IPasswordHasher = {
  async hash(password: string) {
    return argon2id.hash(password, { hashLength: 50 });
  },

  async verify(hashedPassword: string, password: string): Promise<boolean> {
    return argon2id.verify(hashedPassword, password);
  },
};

export { PasswordHasher };
