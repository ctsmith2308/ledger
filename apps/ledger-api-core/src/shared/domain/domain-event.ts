const IdentityEvents = {
  USER_REGISTERED: 'identity.user_registered',
  MFA_ENABLED: 'identity.mfa_enabled',
} as const;

const AccountEvents = {
  ACCOUNT_CREATED: 'accounts.account_created',
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AllEvents = { ...IdentityEvents, ...AccountEvents };

type EventType = (typeof AllEvents)[keyof typeof AllEvents];

abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly eventType: EventType;

  constructor(aggregateId: string, eventType: EventType) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.occurredAt = new Date();
  }
}

export { type EventType, IdentityEvents, AccountEvents, DomainEvent };
