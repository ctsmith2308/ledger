import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class UserProfileUpdatedEvent extends DomainEvent {
  readonly userId: string;

  constructor(userId: string) {
    super(userId, IdentityEvents.USER_PROFILE_UPDATED);
    this.userId = userId;
  }
}

export { UserProfileUpdatedEvent };
