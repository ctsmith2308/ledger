import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class UserRegisteredEvent extends DomainEvent {
  readonly email: string;

  constructor(aggregateId: string, email: string) {
    super(aggregateId, IdentityEvents.USER_REGISTERED);
    this.email = email;
  }
}

export { UserRegisteredEvent };
