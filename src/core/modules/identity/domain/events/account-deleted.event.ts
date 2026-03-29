import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class AccountDeletedEvent extends DomainEvent {
  readonly userId: string;

  constructor(userId: string) {
    super(userId, IdentityEvents.ACCOUNT_DELETED);
    this.userId = userId;
  }
}

export { AccountDeletedEvent };
