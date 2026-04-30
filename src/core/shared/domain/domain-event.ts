import { type EventType } from './constants';

/**
 * Domain Event (DDD). Records that something meaningful happened in
 * the domain. Events are facts, not commands. "UserRegistered" is a
 * fact; "RegisterUser" is a command.
 *
 * Two ownership patterns are used:
 * - Aggregate-raised: the aggregate calls addDomainEvent() during a
 *   state change. The handler pulls and dispatches after persistence.
 * - Handler-dispatched: the handler dispatches directly when no single
 *   aggregate owns the action (e.g. LoginFailed, AccountDeleted).
 *
 * All events flow through the EventBus and are persisted to the
 * domain_events table for audit, cross-module communication, and
 * failure replay.
 */
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
