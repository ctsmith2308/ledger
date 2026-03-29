import { describe, it, expect } from 'vitest';
import { prisma } from '../common/setup-db';
import { UserRepository } from '@/core/modules/identity/infrastructure/persistence/repository/user.repository';
import {
  User,
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

const userRepository = new UserRepository(prisma);

const _makeUser = (overrides: { id?: string; email?: string } = {}) => {
  const id = UserId.from(overrides.id ?? 'a0000000-0000-0000-0000-000000000099');
  const email = Email.from(overrides.email ?? 'test@example.com');
  const passwordHash = Password.fromHash('$argon2id$hashed');
  return User.register(id, email, passwordHash);
};

describe('UserRepository', () => {
  describe('save', () => {
    it('persists a new user', async () => {
      const user = _makeUser();

      await userRepository.save(user);

      const record = await prisma.user.findUnique({
        where: { id: user.id.value },
      });
      expect(record).not.toBeNull();
      expect(record!.email).toBe('test@example.com');
      expect(record!.passwordHash).toBe('$argon2id$hashed');
    });

    it('upserts an existing user', async () => {
      const user = _makeUser();
      await userRepository.save(user);

      const updated = User.reconstitute(
        user.id,
        user.email,
        user.passwordHash,
        UserTier.from('TRIAL'),
        true,
        'mfa-secret',
      );
      await userRepository.save(updated);

      const record = await prisma.user.findUnique({
        where: { id: user.id.value },
      });
      expect(record!.mfaEnabled).toBe(true);
      expect(record!.mfaSecret).toBe('mfa-secret');
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = _makeUser();
      await userRepository.save(user);

      const found = await userRepository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(user.id.value);
      expect(found!.email.value).toBe('test@example.com');
    });

    it('returns null when not found', async () => {
      const id = UserId.from('a0000000-0000-0000-0000-000000000000');

      const found = await userRepository.findById(id);

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      const user = _makeUser();
      await userRepository.save(user);

      const found = await userRepository.findByEmail(user.email);

      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(user.id.value);
    });

    it('returns null when not found', async () => {
      const email = Email.from('nonexistent@example.com');

      const found = await userRepository.findByEmail(email);

      expect(found).toBeNull();
    });
  });
});
