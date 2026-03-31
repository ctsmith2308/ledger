import { NextRequest, NextResponse } from 'next/server';

import { budgetsController } from '@/core/modules/budgets';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service';

import { toErrorResponse } from '@/core/shared/infrastructure';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jwtResult = await JwtService.verify(token);

  if (jwtResult.isFailure) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await budgetsController.getBudgetOverview(
      jwtResult.value.userId,
      new Date(),
    );

    return NextResponse.json(data);
  } catch (error: unknown) {
    const { code, message } = toErrorResponse(error);

    return NextResponse.json({ code, message }, { status: 500 });
  }
}

export { GET };
