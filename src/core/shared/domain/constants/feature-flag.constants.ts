/**
 * Source of truth for all feature flags in the system.
 *
 * Adding a flag: add the key here, then seed the feature_flags table
 * with tier-level access (see prisma/seed.ts). The withFeatureFlag
 * middleware checks these keys at the action boundary.
 *
 * In production, this file + the seed data define the full access
 * matrix. There is no admin UI for runtime toggling yet. Flag changes
 * require a database update or re-seed.
 */
const FEATURE_KEYS = {
  BUDGET_WRITE: 'BUDGET_WRITE',
  PLAID_CONNECT: 'PLAID_CONNECT',
  ACCOUNT_WRITE: 'ACCOUNT_WRITE',
  MFA: 'MFA',
} as const;

type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

export { FEATURE_KEYS, type FeatureKey };
