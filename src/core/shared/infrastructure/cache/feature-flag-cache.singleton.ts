import { Redis } from '@upstash/redis';

import { UpstashFeatureFlagCache } from './feature-flag.cache.impl';

const redis = Redis.fromEnv();

const featureFlagCache = new UpstashFeatureFlagCache(redis);

export { featureFlagCache };
