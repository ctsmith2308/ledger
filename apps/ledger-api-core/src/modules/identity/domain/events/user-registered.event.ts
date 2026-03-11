import { DomainEvent } from '@/shared/domain';
import { IdentityEvents } from '@/shared/domain';

class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly id: string,
    private readonly email: string,
  ) {
    super(id, IdentityEvents.USER_REGISTERED);
  }
}

export { UserRegisteredEvent };
