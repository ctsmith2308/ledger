import { describe, it, expect, vi } from 'vitest';
import { IdentityController } from '../identity.controller';
import {
  Result,
  DomainException,
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

const _makeController = () => {
  const commandBus = _mockBus();
  const queryBus = _mockBus();

  const controller = new IdentityController(
    commandBus as never,
    queryBus as never,
  );

  return { controller, commandBus, queryBus };
};

describe('IdentityController', () => {
  describe('registerUser', () => {
    it('returns UserDTO on success', async () => {
      const { controller, commandBus } = _makeController();

      const user = User.register(
        UserId.from('user-1'),
        Email.from('test@example.com'),
        Password.fromHash('hash'),
      );

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ type: 'SUCCESS', user }),
      );

      const dto = await controller.registerUser(
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
      const { controller, commandBus } = _makeController();

      commandBus.dispatch.mockResolvedValue(
        Result.fail(new InvalidEmailException()),
      );

      await expect(
        controller.registerUser('Test', 'User', 'bad', 'Secure!1'),
      ).rejects.toBeInstanceOf(InvalidEmailException);
    });
  });

  describe('loginUser', () => {
    it('returns JwtDTO on success', async () => {
      const { controller, commandBus } = _makeController();

      commandBus.dispatch.mockResolvedValue(
        Result.ok({
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
        }),
      );

      const dto = await controller.loginUser(
        'test@example.com',
        'Secure!1',
      );

      expect(dto).toEqual({
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
      });
    });

    it('throws on handler failure', async () => {
      const { controller, commandBus } = _makeController();

      commandBus.dispatch.mockResolvedValue(
        Result.fail(new InvalidEmailException()),
      );

      await expect(
        controller.loginUser('bad', 'Secure!1'),
      ).rejects.toBeInstanceOf(InvalidEmailException);
    });
  });

  describe('logoutUser', () => {
    it('does not throw on success', async () => {
      const { controller, commandBus } = _makeController();

      commandBus.dispatch.mockResolvedValue(Result.ok(undefined));

      await expect(
        controller.logoutUser('session-token'),
      ).resolves.not.toThrow();
    });
  });

  describe('updateUserProfile', () => {
    it('returns UserProfileDTO on success', async () => {
      const { controller, commandBus } = _makeController();

      const profile = UserProfile.save(
        UserId.from('user-1'),
        FirstName.create('Updated').value,
        LastName.create('Name').value,
      );

      commandBus.dispatch.mockResolvedValue(Result.ok(profile));

      const dto = await controller.updateUserProfile(
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
      const { controller, commandBus } = _makeController();

      commandBus.dispatch.mockResolvedValue(Result.ok(undefined));

      await expect(
        controller.deleteAccount('user-1'),
      ).resolves.not.toThrow();
    });
  });

  describe('cleanupExpiredTrials', () => {
    it('returns CleanupDTO on success', async () => {
      const { controller, commandBus } = _makeController();

      commandBus.dispatch.mockResolvedValue(
        Result.ok({ deleted: 3, total: 5 }),
      );

      const dto = await controller.cleanupExpiredTrials();

      expect(dto).toEqual({ deleted: 3, total: 5 });
    });
  });

  describe('getUserProfile', () => {
    it('returns UserProfileDTO on success', async () => {
      const { controller, queryBus } = _makeController();

      const profile = UserProfile.save(
        UserId.from('user-1'),
        FirstName.create('Test').value,
        LastName.create('User').value,
      );

      queryBus.dispatch.mockResolvedValue(Result.ok(profile));

      const dto = await controller.getUserProfile('user-1');

      expect(dto).toEqual({
        userId: 'user-1',
        firstName: 'Test',
        lastName: 'User',
      });
    });
  });
});
