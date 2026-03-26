const IdentityEvents = {
  USER_REGISTERED: 'identity.user_registered',
  USER_LOGGED_IN: 'identity.user_logged_in',
  MFA_ENABLED: 'identity.mfa_enabled',
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

abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly eventType: EventType;

  constructor(aggregateId: string, eventType: EventType) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.occurredAt = new Date();
  }
}

export {
  type EventType,
  IdentityEvents,
  BankingEvents,
  TransactionEvents,
  BudgetEvents,
  DomainEvent,
};
