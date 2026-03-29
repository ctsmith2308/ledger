import { NextRequest, NextResponse } from 'next/server';

import { identityController } from '@/core/modules/identity';
import { logger } from '@/core/shared/infrastructure';

const TRIAL_TTL_HOURS = Number(process.env.TRIAL_TTL_HOURS ?? 48);

async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deleted, total } = await identityController.cleanupExpiredTrials(
    TRIAL_TTL_HOURS,
  );

  logger.info(
    `Trial cleanup: ${deleted}/${total} expired users deleted`,
  );

  return NextResponse.json({ deleted, total });
}

export { GET };
