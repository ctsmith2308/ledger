import { DomainEvent } from './domain-event';

/**
 * Aggregate Root (DDD). The consistency boundary for a cluster of
 * related entities and value objects. All state changes go through
 * the aggregate, and all domain events are raised here.
 *
 * Events are collected via addDomainEvent() during mutations, then
 * pulled by the handler via pullDomainEvents() after persistence.
 * Pulling clears the internal list so events are dispatched exactly
 * once. reconstitute() factories never raise events because rebuilding
 * from the database is not a new state change.
 *
 * Examples: User, UserProfile, UserSession, Transaction, Budget,
 * PlaidItem, BankAccount.
 */
abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];

    this._domainEvents = [];

    return events;
  }
}

export { AggregateRoot };
