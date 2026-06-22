import { NextRequest, NextResponse } from 'next/server';

import { Receiver } from '@upstash/qstash';

import '@/core/modules/transactions';
import '@/core/modules/budgets';

import { eventBus } from '@/core/shared/infrastructure/bus/event-bus.singleton';
import { EventBus } from '@/core/shared/infrastructure/bus/event-bus.impl';
import { deserializeEvent } from '@/core/shared/infrastructure/bus/event-serialization.util';
import { logger } from '@/core/shared/infrastructure';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('upstash-signature') ?? '';

  const isValid = await receiver
    .verify({ body, signature })
    .then(() => true)
    .catch(() => false);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const recordId = request.headers.get('x-event-record-id');
  const eventType = request.headers.get('x-event-type');

  if (!recordId || !eventType) {
    return NextResponse.json(
      { error: 'Missing event headers' },
      { status: 400 },
    );
  }

  const payload = JSON.parse(body);
  const event = deserializeEvent(eventType, payload);

  if (!event) {
    return NextResponse.json(
      { error: 'Failed to deserialize event' },
      { status: 400 },
    );
  }

  try {
    await (eventBus as EventBus).process(event, recordId);
    return NextResponse.json({ status: 'processed' });
  } catch (_error) {
    logger.error(`Event processing failed: ${eventType} [${recordId}]`);

    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

export { POST };
