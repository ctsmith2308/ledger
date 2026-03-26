type PlaidAccountData = {
  accountId: string;
  name: string;
  officialName: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  availableBalance: number | null;
  currentBalance: number | null;
  currencyCode: string | null;
};

type PlaidTransactionData = {
  transactionId: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName: string | null;
  category: string | null;
  detailedCategory: string | null;
  pending: boolean;
  paymentChannel: string | null;
};

type PlaidSyncResult = {
  added: PlaidTransactionData[];
  modified: PlaidTransactionData[];
  removed: string[];
  nextCursor: string;
  hasMore: boolean;
};

interface IPlaidClient {
  createLinkToken(userId: string): Promise<{ linkToken: string }>;
  exchangePublicToken(
    publicToken: string,
  ): Promise<{ accessToken: string; itemId: string }>;
  getAccounts(accessToken: string): Promise<PlaidAccountData[]>;
  syncTransactions(
    accessToken: string,
    cursor?: string,
  ): Promise<PlaidSyncResult>;
}

export {
  type PlaidAccountData,
  type PlaidTransactionData,
  type PlaidSyncResult,
  type IPlaidClient,
};
