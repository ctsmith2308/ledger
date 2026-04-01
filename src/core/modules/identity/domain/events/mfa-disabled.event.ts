import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class MfaDisabledEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, IdentityEvents.MFA_DISABLED);
  }
}

export { MfaDisabledEvent };
