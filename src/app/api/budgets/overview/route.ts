import { NextRequest, NextResponse } from 'next/server';

import { budgetsService } from '@/core/modules/budgets';

import { JWT_TYPE } from '@/core/shared/domain';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';
import { toErrorResponse } from '@/core/shared/infrastructure';

import { ACCESS_TOKEN } from '@/app/_shared/config/auth.config';

async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sub: userId } = await JwtService.verify(token, JWT_TYPE.ACCESS);

    const data = await budgetsService.getBudgetOverview(userId, new Date());

    return NextResponse.json(data);
  } catch (error: unknown) {
    const { code, message } = toErrorResponse(error);

    return NextResponse.json({ code, message }, { status: 500 });
  }
}

export { GET };
