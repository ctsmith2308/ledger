import { type IFeatureFlagRepository } from '../../domain';

import { type PrismaService } from '../persistence/prisma.service';

/**
 * Queries the feature_flags Prisma table for enabled flags by tier.
 *
 * The flag keys are defined in FEATURE_KEYS (domain/constants).
 * The tier-to-flag access matrix is seeded in prisma/seed.ts.
 * This repo is the database fallback when the Redis cache misses.
 * See: UpstashFeatureFlagCache for the cache-aside layer in front.
 */
class FeatureFlagRepository implements IFeatureFlagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEnabledByTier(tier: string): Promise<string[]> {
    const flags = await this.prisma.featureFlag.findMany({
      where: { tier, enabled: true },
      select: { feature: true },
    });

    return flags.map((f: { feature: string }) => f.feature);
  }
}

export { FeatureFlagRepository };
