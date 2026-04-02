const IdentityEvents = {
  USER_REGISTERED: 'identity.user_registered',
  USER_LOGGED_IN: 'identity.user_logged_in',
  USER_LOGGED_OUT: 'identity.user_logged_out',
  USER_PROFILE_UPDATED: 'identity.user_profile_updated',
  ACCOUNT_DELETED: 'identity.account_deleted',
  LOGIN_FAILED: 'identity.login_failed',
  MFA_ENABLED: 'identity.mfa_enabled',
  MFA_DISABLED: 'identity.mfa_disabled',
} as const;

const BankingEvents = {
  BANK_ACCOUNT_LINKED: 'banking.bank_account_linked',
  ACCOUNTS_SYNCED: 'banking.accounts_synced',
} as const;

const TransactionEvents = {
  TRANSACTION_CREATED: 'transactions.transaction_created',
  TRANSACTIONS_SYNCED: 'transactions.transactions_synced',
} as const;

const BudgetEvents = {
  BUDGET_CREATED: 'budgets.budget_created',
  BUDGET_THRESHOLD_REACHED: 'budgets.budget_threshold_reached',
  BUDGET_EXCEEDED: 'budgets.budget_exceeded',
} as const;

const AllEvents = {
  ...IdentityEvents,
  ...BankingEvents,
  ...TransactionEvents,
  ...BudgetEvents,
};

type EventType = (typeof AllEvents)[keyof typeof AllEvents];

export {
  IdentityEvents,
  BankingEvents,
  TransactionEvents,
  BudgetEvents,
  type EventType,
};
