const queryKeys = {
  session: ['session'] as const,
  profile: ['profile'] as const,
  accounts: ['accounts'] as const,
  transactions: ['transactions'] as const,
  spending: (month: string) => ['spending', month] as const,
  budgets: ['budgets'] as const,
  budgetOverview: ['budget-overview'] as const,
  featureFlags: ['feature-flags'] as const,
};

export { queryKeys };
