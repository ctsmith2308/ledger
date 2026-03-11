import { EventType } from '@/shared/domain';

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

export { DomainEvent };
