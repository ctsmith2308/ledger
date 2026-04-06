import { NextResponse } from 'next/server';

import { prisma } from '@/core/shared/infrastructure';

async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 });
  }
}

export { GET };
