import { describe, it, expect } from 'vitest';

import { prisma } from '@/tests/common/setup-db';

import {
  User,
  UserId,
  Email,
  Password,
  SessionId,
  UserSession,
} from '@/core/modules/identity/domain';

import { UserRepository } from '../user.repository.impl';
import { UserSessionRepository } from '../user-session.repository.impl';

const userRepository = new UserRepository(prisma);
const sessionRepository = new UserSessionRepository(prisma);

const _seedUser = async () => {
  const user = User.register(
    UserId.from('a0000000-0000-0000-0000-000000000099'),
    Email.from('session-test@example.com'),
    Password.fromHash('$argon2id$hashed'),
  );
  await userRepository.save(user);
  return user;
};

const _makeSession = (userId: UserId, sessionId?: string) =>
  UserSession.create(
    SessionId.from(sessionId ?? 'b0000000-0000-0000-0000-000000000001'),
    userId,
  );

describe('UserSessionRepository', () => {
  describe('save', () => {
    it('persists a new session', async () => {
      const user = await _seedUser();
      const session = _makeSession(user.id);

      await sessionRepository.save(session);

      const record = await prisma.userSession.findUnique({
        where: { id: session.id.value },
      });
      expect(record).not.toBeNull();
      expect(record!.userId).toBe(user.id.value);
    });
  });

  describe('findById', () => {
    it('returns the session when found', async () => {
      const user = await _seedUser();
      const session = _makeSession(user.id);
      await sessionRepository.save(session);

      const found = await sessionRepository.findById(session.id);

      expect(found).not.toBeNull();
      expect(found!.userId.value).toBe(user.id.value);
      expect(found!.isValid).toBe(true);
    });

    it('returns null when not found', async () => {
      const id = SessionId.from('b0000000-0000-0000-0000-000000000000');

      const found = await sessionRepository.findById(id);

      expect(found).toBeNull();
    });
  });

  describe('revokeById', () => {
    it('sets revokedAt on the session', async () => {
      const user = await _seedUser();
      const session = _makeSession(user.id);
      await sessionRepository.save(session);

      await sessionRepository.revokeById(session.id);

      const found = await sessionRepository.findById(session.id);
      expect(found).not.toBeNull();
      expect(found!.isRevoked).toBe(true);
    });
  });

  describe('revokeAllForUser', () => {
    it('revokes all active sessions for a user', async () => {
      const user = await _seedUser();
      const session1 = _makeSession(user.id, 'b0000000-0000-0000-0000-000000000001');
      const session2 = _makeSession(user.id, 'b0000000-0000-0000-0000-000000000002');
      await sessionRepository.save(session1);
      await sessionRepository.save(session2);

      await sessionRepository.revokeAllForUser(user.id);

      const found1 = await sessionRepository.findById(session1.id);
      const found2 = await sessionRepository.findById(session2.id);
      expect(found1!.isRevoked).toBe(true);
      expect(found2!.isRevoked).toBe(true);
    });

    it('does not revoke already-revoked sessions again', async () => {
      const user = await _seedUser();
      const session = _makeSession(user.id);
      await sessionRepository.save(session);
      await sessionRepository.revokeById(session.id);

      const beforeRevoke = await sessionRepository.findById(session.id);
      const firstRevokedAt = beforeRevoke!.revokedAt;

      await sessionRepository.revokeAllForUser(user.id);

      const afterRevoke = await sessionRepository.findById(session.id);
      expect(afterRevoke!.revokedAt).toEqual(firstRevokedAt);
    });
  });
});
