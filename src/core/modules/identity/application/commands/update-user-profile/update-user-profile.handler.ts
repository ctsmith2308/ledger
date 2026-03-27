import {
  IHandler,
  Result,
  ValidationException,
  UserNotFoundException,
} from '@/core/shared/domain';
import {
  IUserProfileRepository,
  UserId,
  FirstName,
  LastName,
  UserProfile,
} from '@/core/modules/identity/domain';

import {
  UpdateUserProfileCommand,
  UpdateUserProfileResponse,
} from './update-user-profile.command';

class UpdateUserProfileHandler
  implements IHandler<UpdateUserProfileCommand, UpdateUserProfileResponse>
{
  constructor(
    private readonly profileRepository: IUserProfileRepository,
  ) {}

  async execute(
    command: UpdateUserProfileCommand,
  ): Promise<UpdateUserProfileResponse> {
    const firstNameResult = FirstName.create(command.firstName);
    if (firstNameResult.isFailure)
      return Result.fail(new ValidationException(firstNameResult.error.message));
    const firstName = firstNameResult.value;

    const lastNameResult = LastName.create(command.lastName);
    if (lastNameResult.isFailure)
      return Result.fail(new ValidationException(lastNameResult.error.message));
    const lastName = lastNameResult.value;

    const userId = UserId.from(command.userId);

    const existing = await this.profileRepository.findById(userId);

    if (!existing) {
      const profile = UserProfile.save(userId, firstName, lastName);
      await this.profileRepository.save(profile);
      return Result.ok(profile);
    }

    existing.updateName(firstName, lastName);
    await this.profileRepository.save(existing);

    return Result.ok(existing);
  }
}

export { UpdateUserProfileHandler };
