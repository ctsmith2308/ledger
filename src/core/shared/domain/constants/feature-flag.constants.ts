const FEATURE_KEYS = {
  BUDGET_WRITE: 'BUDGET_WRITE',
  PLAID_CONNECT: 'PLAID_CONNECT',
  ACCOUNT_WRITE: 'ACCOUNT_WRITE',
  MFA: 'MFA',
} as const;

type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

export { FEATURE_KEYS, type FeatureKey };
