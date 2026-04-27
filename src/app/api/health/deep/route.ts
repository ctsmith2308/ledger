import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Client } from '@upstash/qstash';
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';

import { prisma } from '@/core/shared/infrastructure';

type CheckResult = {
  status: 'ok' | 'unhealthy';
  latencyMs: number;
  error?: string;
};

type DeepHealthResponse = {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Record<string, CheckResult>;
};

const runCheck = async (fn: () => Promise<void>): Promise<CheckResult> => {
  const start = Date.now();

  try {
    await fn();

    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    return { status: 'unhealthy', latencyMs: Date.now() - start, error: message };
  }
};

const checkPostgres = () => runCheck(async () => {
  await prisma.$queryRaw`SELECT 1`;
});

// TODO: These checks instantiate new clients instead of reusing shared singletons.
// A misconfigured singleton could pass the health check while the app is broken.
// Consider injecting the shared instances (redis, qstash, plaidClient) instead.
const checkRedis = () => runCheck(async () => {
  const redis = Redis.fromEnv();
  await redis.ping();
});

const checkQStash = () => runCheck(async () => {
  const client = new Client({ token: process.env.QSTASH_TOKEN! });
  await client.dlq.listMessages();
});

const checkPlaid = () => runCheck(async () => {
  const configuration = new Configuration({
    basePath:
      PlaidEnvironments[
        (process.env.PLAID_ENV as keyof typeof PlaidEnvironments) ?? 'sandbox'
      ],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  });
  const plaid = new PlaidApi(configuration);
  await plaid.institutionsGet({ count: 1, offset: 0, country_codes: ['US' as never] });
});

async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [postgres, redis, qstash, plaid] = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkQStash(),
    checkPlaid(),
  ]);

  const checks = { postgres, redis, qstash, plaid };

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const allDown = Object.values(checks).every((c) => c.status === 'unhealthy');

  const status = allOk ? 'ok' : allDown ? 'unhealthy' : 'degraded';
  const httpStatus = allOk ? 200 : 503;

  const response: DeepHealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(response, { status: httpStatus });
}

export { GET };
