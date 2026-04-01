import { createMiddleware } from 'next-safe-action';

// TODO: Replace with feature_flags table lookup when it lands
const withFeatureFlag = createMiddleware().define(async ({ next }) => {
  return next();
});

export { withFeatureFlag };
