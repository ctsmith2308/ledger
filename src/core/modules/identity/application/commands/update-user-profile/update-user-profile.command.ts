import { Command, DomainException, Result } from '@/core/shared/domain';
import { UserProfile } from '@/core/modules/identity/domain';

type UpdateUserProfileResponse = Result<UserProfile, DomainException>;

class UpdateUserProfileCommand extends Command<UpdateUserProfileResponse> {
  constructor(
    readonly userId: string,
    readonly firstName: string,
    readonly lastName: string,
  ) {
    super();
  }
}

export { UpdateUserProfileCommand, type UpdateUserProfileResponse };
