import { type ArchitectureDecision } from '../types';

const featureFlags: ArchitectureDecision = {
  slug: 'feature-flags',
  title: 'Feature flags',
  subtitle:
    'Tier-gated, cache-aside, zero vendor. A database table and a Redis cache replace a SaaS subscription.',
  badge: 'Infrastructure',
  context:
    'The application supports three user tiers (DEMO, TRIAL, and FULL) each with different feature access. DEMO users can browse but not mutate. TRIAL users get full access for a limited time. FULL users get everything. The naive approach is conditional checks scattered across handlers and components. The SaaS approach (LaunchDarkly, Unleash) adds vendor lock-in, runtime dependencies, and cost for a problem that is fundamentally a database lookup.',
  decision:
    'A Postgres table stores feature flags keyed by (tier, feature) with a boolean enabled column. An Upstash Redis cache sits in front with a one-hour TTL using the cache-aside pattern: check cache first, fall back to database on miss, populate cache for subsequent reads. A next-safe-action middleware (withFeatureFlag) enforces feature access at the action boundary before any business logic executes. The middleware is instrumented with OpenTelemetry spans that track cache hits and misses.',
  rationale: [
    'Tier-based gating is a lookup, not a rules engine. A (tier, feature) composite key with a boolean maps the entire access matrix in a single table. Adding a feature is one seed row, not a vendor dashboard workflow.',
    'Cache-aside with Redis eliminates database round-trips for the hot path. Feature checks run on every mutation. Without caching, every budget create, every Plaid connect, every account update hits Postgres. A one-hour TTL means stale flags resolve within an hour of a database change.',
    'Middleware enforcement means feature gating cannot be forgotten. It runs in the action chain before input validation and before the handler. A developer cannot accidentally expose a gated feature because the middleware throws FeatureDisabledException before the action function is reached.',
    'OpenTelemetry spans on the middleware surface cache performance in production traces. A sudden spike in cache misses indicates Redis connectivity issues or TTL misconfiguration, visible in Grafana without dedicated monitoring.',
    'No vendor dependency means no runtime risk from third-party outages, no per-seat pricing, and no SDK version management. The entire system is four files: a Prisma model, a repository, a cache implementation, and a middleware.',
  ],
  tradeoffs: [
    {
      pro: 'Zero cost, zero vendor lock-in. The feature flag system is a Postgres table, a Redis cache, and a middleware, all owned by the codebase.',
      con: 'No runtime toggle UI. Flags are currently seed-only. Changing a flag requires a database update or re-seed, not a dashboard click.',
    },
    {
      pro: 'Middleware enforcement is foolproof. Feature access is checked before business logic runs, not inside it. Impossible to ship a mutation that skips the check.',
      con: 'Middleware runs per-action, not per-page. Read operations rendered in server components are not gated by this middleware. They rely on the client hiding UI elements based on the features array, which is a presentation concern, not a security boundary.',
    },
    {
      pro: 'Cache-aside with one-hour TTL keeps feature checks sub-millisecond for the common case. Cache populates on first access, no cold-start penalty.',
      con: 'Flag changes are not instant. A disabled feature remains cached as enabled for up to one hour. For emergency disabling, the cache has to be manually invalidated or the TTL reduced.',
    },
    {
      pro: 'Tier-based model is simple and predictable. The access matrix is the cross-product of tiers and features. No complex targeting rules, no percentage rollouts, no segment definitions.',
      con: 'No user-level targeting or gradual rollouts. If a feature needs to be enabled for one specific user or rolled out to 10% of a tier, the current model cannot express that.',
    },
  ],
  codeBlocks: [
    {
      label: 'withFeatureFlag middleware. Cache-aside with OTel instrumentation',
      code: `const withFeatureFlag = (feature: string) =>
  createMiddleware<{ ctx: { userId: string } }>()
    .define(async ({ ctx, next }) => {
    const { userId } = ctx;

    const span = tracer.startSpan('middleware.withFeatureFlag');
    span.setAttribute('feature', feature);

    let features = await featureFlagCache.getFeatures(userId);

    if (!features) {
      span.addEvent('cache_miss');
      const account = await identityService
        .getUserAccount(userId);
      features = account.features;
      await featureFlagCache.setFeatures(userId, features);
    } else {
      span.addEvent('cache_hit');
    }

    if (!features.includes(feature)) {
      throw new FeatureDisabledException();
    }

    const result = await next();
    span.end();
    return result;
  });`,
    },
    {
      label: 'Action chain. Auth, feature gate, validate, execute',
      code: `const createBudgetAction = actionClient
  .metadata({ actionName: 'createBudget' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.BUDGET_WRITE))
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsService.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );
  });`,
    },
    {
      label: 'Redis cache-aside. Sets with TTL',
      code: `const CACHE_KEY = (userId: string) =>
  \`user:\${userId}:features\`;
const CACHE_TTL = 60 * 60; // 1 hour

class UpstashFeatureFlagCache implements IFeatureFlagCache {
  constructor(private readonly redis: Redis) {}

  async getFeatures(
    userId: string,
  ): Promise<string[] | null> {
    const members = await this.redis
      .smembers(CACHE_KEY(userId));
    return members.length > 0 ? members : null;
  }

  async setFeatures(
    userId: string,
    features: string[],
  ): Promise<void> {
    const key = CACHE_KEY(userId);
    await this.redis.del(key);

    if (features.length > 0) {
      await this.redis.sadd(
        key,
        ...(features as [string, ...string[]]),
      );
      await this.redis.expire(key, CACHE_TTL);
    }
  }
}`,
    },
    {
      label: 'Tier-based access matrix. Seed data',
      code: `// DEMO: all features disabled (read-only)
// TRIAL: all features enabled (time-limited)
// FULL: all features enabled (permanent)

const tiers = [
  { tier: USER_TIERS.DEMO, enabled: false },
  { tier: USER_TIERS.TRIAL, enabled: true },
  { tier: USER_TIERS.FULL, enabled: true },
];

const featureFlagRows = tiers.flatMap(({ tier, enabled }) =>
  features.map((feature) => ({ tier, feature, enabled })),
);`,
    },
  ],
};

export { featureFlags };
