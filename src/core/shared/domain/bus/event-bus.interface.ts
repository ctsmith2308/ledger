import { DomainEvent } from '../domain-event';

type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void>;

/**
 * Event bus interface. Defined in the domain layer so aggregates and
 * handlers depend on the abstraction, not the delivery mechanism.
 *
 * The current implementation (EventBus) persists to Postgres and
 * publishes to QStash for async handler execution. Swapping to SQS,
 * Redis Streams, or an in-process bus is an infrastructure change
 * behind this interface. Domain code never changes.
 */
interface IEventBus {
  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void;
  dispatch(events: DomainEvent[]): Promise<void>;
}

export { type IEventBus, type EventHandler };
