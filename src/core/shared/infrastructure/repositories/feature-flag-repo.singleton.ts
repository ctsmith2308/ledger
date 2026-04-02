import { FeatureFlagRepository } from './feature-flag.repository.impl';

import { prisma } from '../persistence/prisma.singleton';

const featureFlagRepo = new FeatureFlagRepository(prisma);

export { featureFlagRepo };
