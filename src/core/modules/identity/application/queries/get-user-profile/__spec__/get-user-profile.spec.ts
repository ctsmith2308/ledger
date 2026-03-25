import { describe, it, expect, vi } from 'vitest';
import { GetUserProfileHandler } from '../get-user-profile.handler';
import { GetUserProfileQuery } from '../get-user-profile.query';
import {
  type IUserProfileRepository,
  UserId,
  FirstName,
  LastName,
  UserProfile,
} from '@/core/modules/identity/domain';
import { UserNotFoundException } from '@/core/shared/domain';

const _existingProfile = () =>
  UserProfile.reconstitute(
    UserId.from('user-12345'),
    FirstName.from('Alice'),
    LastName.from('Smith'),
  );

const _makeHandler = (
  overrides: Partial<IUserProfileRepository> = {},
) => {
  const userProfileRepository: IUserProfileRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_existingProfile()),
    ...overrides,
  };

  const handler = new GetUserProfileHandler(userProfileRepository);

  return { handler, userProfileRepository };
};

describe('GetUserProfileHandler', () => {
  describe('success path', () => {
    it('returns the profile for a valid user id', async () => {
      const { handler } = _makeHandler();
      const query = new GetUserProfileQuery('user-12345');

      const result = await handler.execute(query);

      expect(result.isSuccess).toBe(true);
      expect(result.value.firstName.value).toBe('Alice');
      expect(result.value.lastName.value).toBe('Smith');
    });
  });

  describe('failure paths', () => {
    it('fails with UserNotFoundException for invalid user id', async () => {
      const { handler } = _makeHandler();
      const query = new GetUserProfileQuery('ab');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UserNotFoundException);
    });

    it('fails with UserNotFoundException when profile not found', async () => {
      const { handler } = _makeHandler({
        findById: vi.fn().mockResolvedValue(null),
      });
      const query = new GetUserProfileQuery('user-99999');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UserNotFoundException);
    });
  });
});
