import { UserPrismaMapper } from '../user.prisma-mapper';
import { Email, Password, UserId, User } from '@/modules/identity/domain';

const makePrismaRecord = (overrides = {}) => ({
  id: 'prisma-uuid-1234',
  email: 'user@example.com',
  passwordHash: '$argon2id$hashed',
  mfaEnabled: false,
  mfaSecret: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('UserPrismaMapper', () => {
  describe('toDomain()', () => {
    it('should map a Prisma record to a User aggregate', () => {
      const record = makePrismaRecord();
      const user = UserPrismaMapper.toDomain(record);

      expect(user.email.value).toBe('user@example.com');
      expect(user.passwordHash.value).toBe('$argon2id$hashed');
      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaSecret).toBeUndefined();
    });

    it('should map mfaSecret when present', () => {
      const record = makePrismaRecord({
        mfaEnabled: true,
        mfaSecret: 'totp-secret',
      });
      const user = UserPrismaMapper.toDomain(record);

      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('totp-secret');
    });

    it('should not emit any domain events (reconstitute path)', () => {
      const record = makePrismaRecord();
      const user = UserPrismaMapper.toDomain(record);

      expect(user.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('toPersistence()', () => {
    it('should map a User aggregate to a Prisma-compatible record', () => {
      const id = UserId.create('test-uuid-12345');
      const email = Email.create('user@example.com');
      const password = Password.fromHash('$argon2id$hashed');
      const user = User.register(id, email, password);

      const record = UserPrismaMapper.toPersistence(user);

      expect(record.email).toBe('user@example.com');
      expect(record.passwordHash).toBe('$argon2id$hashed');
      expect(record.mfaEnabled).toBe(false);
      expect(record.mfaSecret).toBeNull();
    });

    it('should map mfaSecret to null when not set', () => {
      const id = UserId.create('test-uuid-12345');
      const email = Email.create('user@example.com');
      const password = Password.fromHash('hash');
      const user = User.register(id, email, password);

      const record = UserPrismaMapper.toPersistence(user);
      expect(record.mfaSecret).toBeNull();
    });
  });
});
