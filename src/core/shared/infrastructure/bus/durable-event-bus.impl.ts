import {
  DomainEvent,
  IEventBus,
  type EventHandler,
} from '@/core/shared/domain';

import { PrismaService } from '../persistence/prisma.service';

import { logger } from '../utils';

const MAX_ATTEMPTS = 3;

class DurableEventBus implements IEventBus {
  private readonly _handlers = new Map<string, EventHandler[]>();

  constructor(private readonly prisma: PrismaService) {}

  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const existing = this._handlers.get(eventType) ?? [];
    this._handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const record = await this._persist(event);
      await this._process(event, record.id);
    }
  }

  async replayFailed(): Promise<number> {
    const failed = await this.prisma.domainEventRecord.findMany({
      where: { status: 'failed', attempts: { lt: MAX_ATTEMPTS } },
      orderBy: { createdAt: 'asc' },
    });

    let replayed = 0;

    for (const record of failed) {
      const event = _deserialize(record.eventType, record.payload);
      if (!event) continue;

      await this._process(event, record.id);
      replayed++;
    }

    return replayed;
  }

  private async _persist(event: DomainEvent) {
    const payload = _serialize(event) as Parameters<
      typeof this.prisma.domainEventRecord.create
    >[0]['data']['payload'];

    return this.prisma.domainEventRecord.create({
      data: {
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload,
        status: 'pending',
        attempts: 0,
      },
    });
  }

  private async _process(event: DomainEvent, recordId: string): Promise<void> {
    const handlers = this._handlers.get(event.eventType) ?? [];

    if (!handlers.length) {
      logger.debug(`No handlers registered for event: ${event.eventType}`);

      await this.prisma.domainEventRecord.update({
        where: { id: recordId },
        data: { status: 'processed', processedAt: new Date() },
      });

      return;
    }

    try {
      for (const handler of handlers) {
        await handler(event);
      }

      await this.prisma.domainEventRecord.update({
        where: { id: recordId },
        data: { status: 'processed', processedAt: new Date() },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown handler error';

      await this.prisma.domainEventRecord.update({
        where: { id: recordId },
        data: {
          status: 'failed',
          attempts: { increment: 1 },
          error: message,
        },
      });

      logger.error(
        `Event handler failed: ${event.eventType} [${recordId}] — ${message}`,
      );
    }
  }
}

const _serialize = (event: DomainEvent): Record<string, unknown> => {
  const { aggregateId, eventType, occurredAt, ...rest } = event;
  return {
    aggregateId,
    eventType,
    occurredAt: occurredAt.toISOString(),
    ...rest,
  };
};

const _deserialize = (
  eventType: string,
  payload: unknown,
): DomainEvent | null => {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;

  return {
    aggregateId: data.aggregateId as string,
    eventType: eventType,
    occurredAt: new Date(data.occurredAt as string),
    ...data,
  } as DomainEvent;
};

export { DurableEventBus };
