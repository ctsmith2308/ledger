import { describe, it, expect } from 'vitest';
import { prisma } from '../common/setup-db';
import { UserRepository } from '@/core/modules/identity/infrastructure/persistence/repository/user.repository';
import { UserProfileRepository } from '@/core/modules/identity/infrastructure/persistence/repository/user-profile.repository';
import {
  User,
  UserId,
  Email,
  Password,
  FirstName,
  LastName,
  UserProfile,
} from '@/core/modules/identity/domain';

const userRepository = new UserRepository(prisma);
const profileRepository = new UserProfileRepository(prisma);

const _seedUser = async () => {
  const user = User.register(
    UserId.from('a0000000-0000-0000-0000-000000000099'),
    Email.from('profile-test@example.com'),
    Password.fromHash('$argon2id$hashed'),
  );
  await userRepository.save(user);
  return user;
};

const _makeProfile = (userId: UserId) =>
  UserProfile.save(
    userId,
    FirstName.from('Alice'),
    LastName.from('Smith'),
  );

describe('UserProfileRepository', () => {
  describe('save', () => {
    it('persists a new profile', async () => {
      const user = await _seedUser();
      const profile = _makeProfile(user.id);

      await profileRepository.save(profile);

      const record = await prisma.userProfile.findUnique({
        where: { userId: user.id.value },
      });
      expect(record).not.toBeNull();
      expect(record!.firstName).toBe('Alice');
      expect(record!.lastName).toBe('Smith');
    });

    it('upserts an existing profile', async () => {
      const user = await _seedUser();
      const profile = _makeProfile(user.id);
      await profileRepository.save(profile);

      const updated = UserProfile.save(
        user.id,
        FirstName.from('Bob'),
        LastName.from('Jones'),
      );
      await profileRepository.save(updated);

      const record = await prisma.userProfile.findUnique({
        where: { userId: user.id.value },
      });
      expect(record!.firstName).toBe('Bob');
      expect(record!.lastName).toBe('Jones');
    });
  });

  describe('findById', () => {
    it('returns the profile when found', async () => {
      const user = await _seedUser();
      const profile = _makeProfile(user.id);
      await profileRepository.save(profile);

      const found = await profileRepository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found!.firstName.value).toBe('Alice');
      expect(found!.lastName.value).toBe('Smith');
    });

    it('returns null when not found', async () => {
      const id = UserId.from('a0000000-0000-0000-0000-000000000000');

      const found = await profileRepository.findById(id);

      expect(found).toBeNull();
    });
  });
});
