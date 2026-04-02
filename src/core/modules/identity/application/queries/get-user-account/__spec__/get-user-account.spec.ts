import { describe, it, expect, vi } from 'vitest';

import { GetUserAccountHandler } from '../get-user-account.handler';
import { GetUserAccountQuery } from '../get-user-account.query';

import {
  type IUserRepository,
  User,
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

import { UserNotFoundException } from '@/core/shared/domain';

const _makeUser = (opts?: { mfaEnabled?: boolean }) =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    opts?.mfaEnabled ?? false,
    opts?.mfaEnabled ? 'TOTP_SECRET' : undefined,
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeUser()),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const handler = new GetUserAccountHandler(userRepository);

  return { handler, userRepository };
};

describe('GetUserAccountHandler', () => {
  const validQuery = new GetUserAccountQuery('user-12345');

  describe('success path', () => {
    it('returns the user when found', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validQuery);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(User);
    });

    it('looks up the user by id', async () => {
      const { handler, userRepository } = _makeHandler();

      await handler.execute(validQuery);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure paths', () => {
    it('fails with invalid userId format', async () => {
      const { handler } = _makeHandler();
      const query = new GetUserAccountQuery('');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UserNotFoundException);
    });

    it('fails when user is not found', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      const result = await handler.execute(validQuery);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UserNotFoundException);
    });

    it('does not query repository with invalid userId', async () => {
      const { handler, userRepository } = _makeHandler();
      const query = new GetUserAccountQuery('');

      await handler.execute(query);

      expect(userRepository.findById).not.toHaveBeenCalled();
    });
  });
});
