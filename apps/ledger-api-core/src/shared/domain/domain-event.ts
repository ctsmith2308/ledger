abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly eventType: string;

  constructor(aggregateId: string, eventType: string) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.occurredAt = new Date();
  }
}

export { DomainEvent };
