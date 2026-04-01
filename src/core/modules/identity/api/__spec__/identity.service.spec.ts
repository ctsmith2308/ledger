import { describe, it, expect, vi } from 'vitest';

import { IdentityService } from '../identity.service';

import {
  Result,
  InvalidEmailException,
} from '@/core/shared/domain';

import {
  User,
  UserId,
  Email,
  Password,
  UserTier,
  UserProfile,
  FirstName,
  LastName,
} from '@/core/modules/identity/domain';

const _mockBus = () => ({
  register: vi.fn(),
  dispatch: vi.fn(),
});

const _mockJwtService = () => ({
  sign: vi.fn().mockResolvedValue(Result.ok('signed-token')),
  verify: vi.fn().mockResolvedValue(Result.ok('user-1')),
});

const _makeService = () => {
  const commandBus = _mockBus();
  const queryBus = _mockBus();
  const jwtService = _mockJwtService();

  const service = new IdentityService(
    commandBus as never,
    queryBus as never,
    jwtService as never,
  );

  return { service, commandBus, queryBus, jwtService };
};

const _makeUser = (mfaEnabled = false) =>
  User.reconstitute(
    UserId.from('user-1'),
    Email.from('test@example.com'),
    Password.fromHash('hash'),
    UserTier.from('TRIAL'),
    mfaEnabled,
    mfaEnabled ? 'secret' : undefined,
  );

describe('IdentityService', () => {
  describe('registerUser', () => {
    it('returns UserDTO on success', async () => {
      const { service, commandBus } = _makeService();

      const user = User.register(
        UserId.from('user-1'),
        Email.from('test@example.com'),
        Password.fromHash('hash'),
      );

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ type: 'SUCCESS', user }),
      );

      const dto = await service.registerUser(
        'Test',
        'User',
        'test@example.com',
        'Secure!1',
      );

      expect(dto).toEqual({
        type: 'SUCCESS',
        id: 'user-1',
        email: 'test@example.com',
      });
    });

    it('throws on handler failure', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(
        Result.fail(new InvalidEmailException()),
      );

      await expect(
        service.registerUser('Test', 'User', 'bad', 'Secure!1'),
      ).rejects.toBeInstanceOf(InvalidEmailException);
    });
  });

  describe('loginUser', () => {
    it('returns SUCCESS with accessToken when MFA is not enabled', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ type: 'SUCCESS', user: _makeUser() }),
      );

      const dto = await service.loginUser('test@example.com', 'Secure!1');

      expect(dto).toEqual({
        type: 'SUCCESS',
        accessToken: 'signed-token',
      });
    });

    it('returns MFA_REQUIRED with challengeToken when MFA is enabled', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ type: 'MFA_REQUIRED', user: _makeUser(true) }),
      );

      const dto = await service.loginUser('test@example.com', 'Secure!1');

      expect(dto).toEqual({
        type: 'MFA_REQUIRED',
        challengeToken: 'signed-token',
      });
    });

    it('throws on handler failure', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(
        Result.fail(new InvalidEmailException()),
      );

      await expect(
        service.loginUser('bad', 'Secure!1'),
      ).rejects.toBeInstanceOf(InvalidEmailException);
    });
  });

  describe('verifyMfaLogin', () => {
    it('returns accessToken on success', async () => {
      const { service, commandBus, jwtService } = _makeService();

      jwtService.verify.mockResolvedValue(Result.ok('user-1'));
      commandBus.dispatch.mockResolvedValue(Result.ok(_makeUser(true)));

      const result = await service.verifyMfaLogin('challenge-token', '123456');

      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });

  describe('setupMfa', () => {
    it('returns qrCodeDataUrl on success', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ qrCodeDataUrl: 'data:image/png;base64,...' }),
      );

      const result = await service.setupMfa('user-1');

      expect(result).toEqual({ qrCodeDataUrl: 'data:image/png;base64,...' });
    });
  });

  describe('verifyMfaSetup', () => {
    it('does not throw on success', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(Result.ok(_makeUser(true)));

      await expect(
        service.verifyMfaSetup('user-1', '123456'),
      ).resolves.not.toThrow();
    });
  });

  describe('disableMfa', () => {
    it('does not throw on success', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(Result.ok(_makeUser()));

      await expect(
        service.disableMfa('user-1'),
      ).resolves.not.toThrow();
    });
  });

  describe('logoutUser', () => {
    it('does not throw on success', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(Result.ok(undefined));

      await expect(
        service.logoutUser('session-token'),
      ).resolves.not.toThrow();
    });
  });

  describe('updateUserProfile', () => {
    it('returns UserProfileDTO on success', async () => {
      const { service, commandBus } = _makeService();

      const profile = UserProfile.save(
        UserId.from('user-1'),
        FirstName.create('Updated').value,
        LastName.create('Name').value,
      );

      commandBus.dispatch.mockResolvedValue(Result.ok(profile));

      const dto = await service.updateUserProfile(
        'user-1',
        'Updated',
        'Name',
      );

      expect(dto).toEqual({
        userId: 'user-1',
        firstName: 'Updated',
        lastName: 'Name',
      });
    });
  });

  describe('deleteAccount', () => {
    it('does not throw on success', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(Result.ok(undefined));

      await expect(
        service.deleteAccount('user-1'),
      ).resolves.not.toThrow();
    });
  });

  describe('cleanupExpiredTrials', () => {
    it('returns CleanupDTO on success', async () => {
      const { service, commandBus } = _makeService();

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ deleted: 3, total: 5 }),
      );

      const dto = await service.cleanupExpiredTrials();

      expect(dto).toEqual({ deleted: 3, total: 5 });
    });
  });

  describe('getUserProfile', () => {
    it('returns UserProfileDTO on success', async () => {
      const { service, queryBus } = _makeService();

      const profile = UserProfile.save(
        UserId.from('user-1'),
        FirstName.create('Test').value,
        LastName.create('User').value,
      );

      queryBus.dispatch.mockResolvedValue(Result.ok(profile));

      const dto = await service.getUserProfile('user-1');

      expect(dto).toEqual({
        userId: 'user-1',
        firstName: 'Test',
        lastName: 'User',
      });
    });
  });

  describe('getUserAccount', () => {
    it('returns UserAccountDTO on success', async () => {
      const { service, queryBus } = _makeService();

      queryBus.dispatch.mockResolvedValue(Result.ok(_makeUser()));

      const dto = await service.getUserAccount('user-1');

      expect(dto).toEqual({
        email: 'test@example.com',
        tier: 'TRIAL',
        mfaEnabled: false,
      });
    });
  });
});
