import { NextRequest, NextResponse } from 'next/server';

import { budgetsService } from '@/core/modules/budgets';

import { JWT_TYPE } from '@/core/shared/domain';

import { JwtService, toErrorResponse } from '@/core/shared/infrastructure';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jwtResult = await JwtService.verify(token, JWT_TYPE.ACCESS);

  if (jwtResult.isFailure) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await budgetsService.getBudgetOverview(
      jwtResult.value,
      new Date(),
    );

    return NextResponse.json(data);
  } catch (error: unknown) {
    const { code, message } = toErrorResponse(error);

    return NextResponse.json({ code, message }, { status: 500 });
  }
}

export { GET };
