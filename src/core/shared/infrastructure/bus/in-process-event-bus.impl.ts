import {
  DomainEvent,
  IEventBus,
  type EventHandler,
} from '@/core/shared/domain';

import { logger } from '../utils';

class InProcessEventBus implements IEventBus {
  private readonly _handlers = new Map<string, EventHandler[]>();

  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const existing = this._handlers.get(eventType) ?? [];
    this._handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this._handlers.get(event.eventType) ?? [];

      if (!handlers.length) {
        logger.debug(`No handlers registered for event: ${event.eventType}`);
        continue;
      }

      for (const handler of handlers) {
        await handler(event);
      }
    }
  }
}

export { InProcessEventBus };
