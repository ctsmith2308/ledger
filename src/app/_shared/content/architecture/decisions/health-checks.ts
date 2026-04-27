import { type ArchitectureDecision } from '../types';

const healthChecks: ArchitectureDecision = {
  slug: 'health-checks',
  title: 'Two-tier health checks',
  subtitle:
    'A shallow probe keeps the orchestrator happy. A scheduled deep check catches silent dependency failures before users do.',
  badge: 'Infrastructure',
  context:
    'Railway restarts services that stop responding, but a running process does not guarantee a working application. The database connection pool can exhaust, Redis credentials can rotate, QStash signing keys can expire, and Plaid sandbox tokens can be revoked, all while the Node process stays alive and returns 200 on static routes. Without dependency-level checks, these failures surface as user-facing errors with no prior signal.',
  decision:
    'Two health check endpoints. A shallow check at /api/health runs SELECT 1 against Postgres and returns 200 or 503. Railway polls this for liveness. Fast, no auth, no side effects. A deep check at /api/health/deep runs all four dependency checks in parallel (Postgres, Upstash Redis, QStash, Plaid), returns per-check latency and status, and classifies the overall result as ok, degraded, or unhealthy. The deep endpoint is protected by CRON_SECRET and designed for scheduled runs, nightly or weekly via QStash cron.',
  rationale: [
    'Separating shallow from deep avoids a common anti-pattern: putting dependency checks on the liveness probe. If Plaid is temporarily down, the app is still usable for non-banking features. A shallow check that fails on Plaid would trigger unnecessary restarts.',
    'Running all dependency checks in parallel with Promise.all keeps the deep check fast. Each check has its own timeout boundary, so one slow dependency does not block the others.',
    'The three-state response (ok, degraded, unhealthy) gives actionable signal. Degraded means some dependencies are down but the app is partially functional. Unhealthy means nothing works. This distinction matters for incident triage.',
    'CRON_SECRET protection prevents the deep endpoint from being used as an oracle for dependency status by unauthenticated callers. The same secret already protects the cron cleanup job, so there is no new credential to manage.',
  ],
  tradeoffs: [
    {
      pro: 'Shallow check is sub-millisecond and safe to poll every 30 seconds. No risk of rate-limiting external services.',
      con: 'Shallow check only catches Postgres failures. A Redis or QStash outage will not trigger a Railway restart. By design, but it means those failures depend on the scheduled deep check for detection.',
    },
    {
      pro: 'Deep check validates the full dependency chain in one request. Catches credential rotation, network policy changes, and silent service degradation.',
      con: 'Deep check creates real connections to external services. Running it more than nightly could hit rate limits on Plaid sandbox or add measurable cost on QStash.',
    },
    {
      pro: 'Per-check latency reporting surfaces performance degradation before it becomes an outage. A Redis ping jumping from 5ms to 500ms is a leading indicator.',
      con: 'Latency numbers are point-in-time snapshots from the deployment region. They do not reflect client-side latency or cross-region performance.',
    },
  ],
  codeBlocks: [
    {
      label: 'Shallow health check. /api/health',
      code: `async function GET() {
  try {
    await prisma.$queryRaw\`SELECT 1\`;

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json(
      { status: 'unhealthy' },
      { status: 503 },
    );
  }
}`,
    },
    {
      label: 'Deep health check. Parallel dependency validation',
      code: `const runCheck = async (
  fn: () => Promise<void>,
): Promise<CheckResult> => {
  const start = Date.now();

  try {
    await fn();
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error';
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: message,
    };
  }
};

const [postgres, redis, qstash, plaid] = await Promise.all([
  checkPostgres(),
  checkRedis(),
  checkQStash(),
  checkPlaid(),
]);`,
    },
    {
      label: 'Three-state classification. ok, degraded, unhealthy',
      code: `const allOk = Object.values(checks)
  .every((c) => c.status === 'ok');
const allDown = Object.values(checks)
  .every((c) => c.status === 'unhealthy');

const status = allOk
  ? 'ok'
  : allDown
    ? 'unhealthy'
    : 'degraded';

// 200 when all dependencies are healthy
// 503 when any dependency is down
const httpStatus = allOk ? 200 : 503;`,
    },
  ],
};

export { healthChecks };
