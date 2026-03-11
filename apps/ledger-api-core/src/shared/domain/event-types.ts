const IdentityEvents = {
  USER_REGISTERED: 'identity.user_registered',
  MFA_ENABLED: 'identity.mfa_enabled',
} as const;

const AccountEvents = {
  ACCOUNT_CREATED: 'accounts.account_created',
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AllEvents = { ...IdentityEvents, ...AccountEvents };

type EventType = (typeof AllEvents)[keyof typeof AllEvents];

export { type EventType, IdentityEvents, AccountEvents };
