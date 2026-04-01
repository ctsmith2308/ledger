import { DomainEvent, IdentityEvents } from '@/core/shared/domain';

class MfaEnabledEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, IdentityEvents.MFA_ENABLED);
  }
}

export { MfaEnabledEvent };
