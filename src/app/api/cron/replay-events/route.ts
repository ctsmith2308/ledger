import { NextRequest, NextResponse } from 'next/server';

import '@/core/modules/transactions';
import '@/core/modules/budgets';

import { eventBus } from '@/core/shared/infrastructure/bus/event-bus.singleton';
import { EventBus } from '@/core/shared/infrastructure/bus/event-bus.impl';
import { toErrorResponse } from '@/core/shared/infrastructure';

async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const replayed = await (eventBus as EventBus).replayFailed();

    return NextResponse.json({ replayed });
  } catch (error: unknown) {
    const { code, message } = toErrorResponse(error);

    return NextResponse.json({ code, message }, { status: 500 });
  }
}

export { GET };
