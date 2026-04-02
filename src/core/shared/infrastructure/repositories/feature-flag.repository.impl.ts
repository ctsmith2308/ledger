import { type IFeatureFlagRepository } from '../../domain';

import { type PrismaService } from '../persistence/prisma.service';

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
