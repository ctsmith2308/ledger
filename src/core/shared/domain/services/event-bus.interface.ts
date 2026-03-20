import { DomainEvent } from '../domain-event';

type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

interface IEventBus {
  register<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void;
  dispatch(events: DomainEvent[]): Promise<void>;
}

export { type IEventBus, type EventHandler };
