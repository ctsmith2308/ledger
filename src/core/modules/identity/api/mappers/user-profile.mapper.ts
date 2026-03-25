import { UserProfile } from '../../domain/aggregates';

type UserProfileDTO = {
  userId: string;
  firstName: string;
  lastName: string;
};

const UserProfileMapper = {
  toDTO(profile: UserProfile): UserProfileDTO {
    return {
      userId: profile.id.value,
      firstName: profile.firstName.value,
      lastName: profile.lastName.value,
    };
  },
};

export { UserProfileMapper, type UserProfileDTO };
