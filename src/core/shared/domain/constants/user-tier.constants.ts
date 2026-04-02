const USER_TIERS = {
  DEMO: 'DEMO',
  TRIAL: 'TRIAL',
  FULL: 'FULL',
} as const;

type UserTierValue = (typeof USER_TIERS)[keyof typeof USER_TIERS];

export { USER_TIERS, type UserTierValue };
