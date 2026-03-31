import { NextRequest, NextResponse } from 'next/server';

import { identityService } from '@/core/modules/identity';
import { toErrorResponse } from '@/core/shared/infrastructure';

async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { deleted, total } = await identityService.cleanupExpiredTrials();

    return NextResponse.json({ deleted, total });
  } catch (error: unknown) {
    const { code, message } = toErrorResponse(error);

    return NextResponse.json({ code, message }, { status: 500 });
  }
}

export { GET };
