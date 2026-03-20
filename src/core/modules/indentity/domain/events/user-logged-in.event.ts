import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class UserLoggedInEvent extends DomainEvent {
  readonly email: string;

  constructor(aggregateId: string, email: string) {
    super(aggregateId, IdentityEvents.USER_LOGGED_IN);
    this.email = email;
  }
}

export { UserLoggedInEvent };
