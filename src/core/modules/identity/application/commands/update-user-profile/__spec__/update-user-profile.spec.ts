import { describe, it, expect, vi } from 'vitest';
import { UpdateUserProfileHandler } from '../update-user-profile.handler';
import { UpdateUserProfileCommand } from '../update-user-profile.command';
import {
  type IUserProfileRepository,
  UserId,
  FirstName,
  LastName,
  UserProfile,
} from '@/core/modules/identity/domain';
import { type IEventBus } from '@/core/shared/domain';

const _makeHandler = (overrides: {
  profileRepository?: Partial<IUserProfileRepository>;
  eventBus?: Partial<IEventBus>;
} = {}) => {
  const profileRepository: IUserProfileRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(null),
    ...overrides.profileRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new UpdateUserProfileHandler(profileRepository, eventBus);

  return { handler, profileRepository, eventBus };
};

const _existingProfile = () =>
  UserProfile.reconstitute(
    UserId.from('user-1'),
    FirstName.from('Old'),
    LastName.from('Name'),
  );

describe('UpdateUserProfileHandler', () => {
  const validCommand = new UpdateUserProfileCommand(
    'user-1',
    'New',
    'Name',
  );

  describe('success path — profile exists', () => {
    it('updates the profile and returns it', async () => {
      const { handler } = _makeHandler({
        profileRepository: {
          findById: vi.fn().mockResolvedValue(_existingProfile()),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.firstName.value).toBe('New');
      expect(result.value.lastName.value).toBe('Name');
    });

    it('persists the updated profile', async () => {
      const { handler, profileRepository } = _makeHandler({
        profileRepository: {
          findById: vi.fn().mockResolvedValue(_existingProfile()),
        },
      });

      await handler.execute(validCommand);

      expect(profileRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('success path — profile does not exist', () => {
    it('creates a new profile', async () => {
      const { handler, profileRepository } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.firstName.value).toBe('New');
      expect(profileRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('validation failures', () => {
    it('fails with empty first name', async () => {
      const { handler } = _makeHandler();
      const command = new UpdateUserProfileCommand('user-1', '', 'Name');

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('fails with empty last name', async () => {
      const { handler } = _makeHandler();
      const command = new UpdateUserProfileCommand('user-1', 'New', '');

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('does not persist when validation fails', async () => {
      const { handler, profileRepository } = _makeHandler();
      const command = new UpdateUserProfileCommand('user-1', '', 'Name');

      await handler.execute(command);

      expect(profileRepository.save).not.toHaveBeenCalled();
    });
  });
});
