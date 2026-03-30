import { NextRequest, NextResponse } from 'next/server';

import { identityController } from '@/core/modules/identity';
import { toErrorResponse, logger } from '@/core/shared/infrastructure';

async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await identityController.cleanupExpiredTrials();

    const { deleted, total } = result.getValueOrThrow();

    logger.info(
      `Trial cleanup: ${deleted}/${total} expired users deleted`,
    );

    return NextResponse.json({ deleted, total });
  } catch (error: unknown) {
    logger.error(error);

    const { code, message } = toErrorResponse(error);

    return NextResponse.json({ code, message }, { status: 500 });
  }
}

export { GET };
