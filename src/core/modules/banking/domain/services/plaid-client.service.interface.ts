import { Transaction as PlaidSDKTransaction } from 'plaid';

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

type PlaidSyncResult = {
  added: PlaidSDKTransaction[];
  modified: PlaidSDKTransaction[];
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
  itemRemove(accessToken: string): Promise<void>;
}

export {
  type PlaidAccountData,
  type PlaidSyncResult,
  type IPlaidClient,
};
