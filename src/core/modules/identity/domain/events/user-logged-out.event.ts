import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class UserLoggedOutEvent extends DomainEvent {
  readonly userId: string;

  constructor(userId: string) {
    super(userId, IdentityEvents.USER_LOGGED_OUT);
    this.userId = userId;
  }
}

export { UserLoggedOutEvent };
