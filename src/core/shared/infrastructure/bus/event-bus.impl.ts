import { trace, SpanStatusCode } from '@opentelemetry/api';

import { type Client } from '@upstash/qstash';

import {
  DomainEvent,
  IEventBus,
  type EventHandler,
} from '@/core/shared/domain';

import { PrismaService } from '../persistence/prisma.service';

import { logger } from '../utils';

import { serializeEvent, deserializeEvent } from './event-serialization.util';

const tracer = trace.getTracer('ledger');
const MAX_ATTEMPTS = 3;

class EventBus implements IEventBus {
  private readonly _handlers = new Map<string, EventHandler[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly qstash: Client,
    private readonly appUrl: string,
  ) {}

  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const existing = this._handlers.get(eventType) ?? [];
    this._handlers.set(eventType, [...existing, handler as EventHandler]);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await tracer.startActiveSpan(
        `event.dispatch.${event.eventType}`,
        async (span) => {
          span.setAttribute('event.type', event.eventType);
          span.setAttribute('event.aggregateId', event.aggregateId);

          const record = await this._persist(event);
          span.setAttribute('event.recordId', record.id);

          const handlers = this._handlers.get(event.eventType) ?? [];

          if (handlers.length > 0) {
            try {
              await this._publish(event, record.id);
              span.addEvent('qstash_published');
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : 'QStash publish failed';
              span.addEvent('qstash_publish_failed', { error: message });
              span.setStatus({
                code: SpanStatusCode.ERROR,
                message,
              });
              logger.error(
                `QStash publish failed for ${event.eventType} [${record.id}] — ${message}`,
              );
            }
          } else {
            await this.prisma.domainEventRecord.update({
              where: { id: record.id },
              data: { status: 'processed', processedAt: new Date() },
            });
            span.addEvent('audit_only');
          }

          span.end();
        },
      );
    }
  }

  async process(event: DomainEvent, recordId: string): Promise<void> {
    return tracer.startActiveSpan(
      `event.process.${event.eventType}`,
      async (span) => {
        span.setAttribute('event.type', event.eventType);
        span.setAttribute('event.recordId', recordId);

        const existing = await this.prisma.domainEventRecord.findUnique({
          where: { id: recordId },
          select: { status: true },
        });

        if (existing?.status === 'processed') {
          span.addEvent('duplicate_skipped');
          span.end();
          return;
        }

        const handlers = this._handlers.get(event.eventType) ?? [];

        if (!handlers.length) {
          await this.prisma.domainEventRecord.update({
            where: { id: recordId },
            data: { status: 'processed', processedAt: new Date() },
          });
          span.addEvent('no_handlers');
          span.end();
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

          span.addEvent('handlers_completed', {
            handlerCount: handlers.length,
          });
          span.end();
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

          span.setStatus({ code: SpanStatusCode.ERROR, message });
          span.end();

          logger.error(
            `Event handler failed: ${event.eventType} [${recordId}] — ${message}`,
          );

          throw err;
        }
      },
    );
  }

  async replayFailed(): Promise<number> {
    const failed = await this.prisma.domainEventRecord.findMany({
      where: { status: 'failed', attempts: { lt: MAX_ATTEMPTS } },
      orderBy: { createdAt: 'asc' },
    });

    let replayed = 0;

    for (const record of failed) {
      const event = deserializeEvent(record.eventType, record.payload);
      if (!event) continue;

      await this.process(event, record.id);
      replayed++;
    }

    return replayed;
  }

  private async _persist(event: DomainEvent) {
    const payload = serializeEvent(event) as Parameters<
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

  private async _publish(event: DomainEvent, recordId: string): Promise<void> {
    logger.info(`QStash publishing to: ${this.appUrl}/api/events [${event.eventType}] [${recordId}]`);
    await this.qstash.publishJSON({
      url: `${this.appUrl}/api/events`,
      body: serializeEvent(event),
      headers: {
        'x-event-record-id': recordId,
        'x-event-type': event.eventType,
      },
    });
  }
}

export { EventBus };
