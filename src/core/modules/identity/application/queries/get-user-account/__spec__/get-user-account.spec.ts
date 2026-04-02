import { describe, it, expect, vi } from 'vitest';

import { GetUserAccountHandler } from '../get-user-account.handler';
import { GetUserAccountQuery } from '../get-user-account.query';

import {
  type IUserRepository,
  type IUserProfileRepository,
  User,
  UserProfile,
  UserId,
  Email,
  Password,
  UserTier,
  FirstName,
  LastName,
} from '@/core/modules/identity/domain';

import {
  type IFeatureFlagRepository,
  type IFeatureFlagCache,
  UserNotFoundException,
} from '@/core/shared/domain';

const _makeUser = (opts?: { mfaEnabled?: boolean }) =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    opts?.mfaEnabled ?? false,
    opts?.mfaEnabled ? 'TOTP_SECRET' : undefined,
  );

const _makeProfile = () =>
  UserProfile.reconstitute(
    UserId.from('user-12345'),
    FirstName.from('John'),
    LastName.from('Doe'),
  );

const _makeHandler = (
  overrides: {
    userRepository?: Partial<IUserRepository>;
    userProfileRepository?: Partial<IUserProfileRepository>;
    featureFlagRepo?: Partial<IFeatureFlagRepository>;
    featureFlagCache?: Partial<IFeatureFlagCache>;
  } = {},
) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeUser()),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const userProfileRepository: IUserProfileRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeProfile()),
    ...overrides.userProfileRepository,
  };

  const featureFlagRepo: IFeatureFlagRepository = {
    findEnabledByTier: vi
      .fn()
      .mockResolvedValue(['BUDGET_WRITE', 'MFA']),
    ...overrides.featureFlagRepo,
  };

  const featureFlagCache: IFeatureFlagCache = {
    getFeatures: vi.fn().mockResolvedValue(null),
    setFeatures: vi.fn(),
    invalidate: vi.fn(),
    ...overrides.featureFlagCache,
  };

  const handler = new GetUserAccountHandler(
    userRepository,
    userProfileRepository,
    featureFlagRepo,
    featureFlagCache,
  );

  return {
    handler,
    userRepository,
    userProfileRepository,
    featureFlagRepo,
    featureFlagCache,
  };
};

describe('GetUserAccountHandler', () => {
  const validQuery = new GetUserAccountQuery('user-12345');

  describe('success path', () => {
    it('returns user, profile, and features', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validQuery);

      expect(result.isSuccess).toBe(true);
      expect(result.value.user).toBeInstanceOf(User);
      expect(result.value.profile).toBeInstanceOf(UserProfile);
      expect(result.value.features).toEqual(['BUDGET_WRITE', 'MFA']);
    });

    it('fetches user and profile in parallel', async () => {
      const { handler, userRepository, userProfileRepository } =
        _makeHandler();

      await handler.execute(validQuery);

      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(userProfileRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache hit path', () => {
    it('returns cached features without querying the repo', async () => {
      const { handler, featureFlagRepo, featureFlagCache } = _makeHandler({
        featureFlagCache: {
          getFeatures: vi.fn().mockResolvedValue(['PLAID_CONNECT']),
          setFeatures: vi.fn(),
          invalidate: vi.fn(),
        },
      });

      const result = await handler.execute(validQuery);

      expect(result.value.features).toEqual(['PLAID_CONNECT']);
      expect(featureFlagRepo.findEnabledByTier).not.toHaveBeenCalled();
      expect(featureFlagCache.setFeatures).not.toHaveBeenCalled();
    });
  });

  describe('cache miss path', () => {
    it('queries the repo and caches the result', async () => {
      const { handler, featureFlagRepo, featureFlagCache } = _makeHandler();

      await handler.execute(validQuery);

      expect(featureFlagRepo.findEnabledByTier).toHaveBeenCalledWith(
        'TRIAL',
      );
      expect(featureFlagCache.setFeatures).toHaveBeenCalledWith(
        'user-12345',
        ['BUDGET_WRITE', 'MFA'],
      );
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

    it('fails when profile is not found', async () => {
      const { handler } = _makeHandler({
        userProfileRepository: {
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
