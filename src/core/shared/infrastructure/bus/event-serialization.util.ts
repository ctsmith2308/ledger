import { DomainEvent } from '@/core/shared/domain';

const serializeEvent = (event: DomainEvent): Record<string, unknown> => {
  const { aggregateId, eventType, occurredAt, ...rest } = event;
  return {
    aggregateId,
    eventType,
    occurredAt: occurredAt.toISOString(),
    ...rest,
  };
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const _reviveDates = (
  data: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    result[key] =
      typeof value === 'string' && ISO_DATE_PATTERN.test(value)
        ? new Date(value)
        : value;
  }

  return result;
};

const deserializeEvent = (
  eventType: string,
  payload: unknown,
): DomainEvent | null => {
  if (!payload || typeof payload !== 'object') return null;

  const data = _reviveDates(payload as Record<string, unknown>);

  return {
    ...data,
    aggregateId: data.aggregateId as string,
    eventType,
    occurredAt: new Date(data.occurredAt as string),
  } as DomainEvent;
};

export { serializeEvent, deserializeEvent };
