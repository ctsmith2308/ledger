import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid';

import {
  IPlaidClient,
  PlaidAccountData,
  PlaidSyncResult,
} from '@/core/modules/banking/domain';

class PlaidClientService implements IPlaidClient {
  private constructor(private readonly plaidApi: PlaidApi) {}

  static create(): PlaidClientService {
    const configuration = new Configuration({
      basePath:
        PlaidEnvironments[
          (process.env.PLAID_ENV as keyof typeof PlaidEnvironments) ?? 'sandbox'
        ],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    const plaidApi = new PlaidApi(configuration);

    return new PlaidClientService(plaidApi);
  }

  async createLinkToken(userId: string): Promise<{ linkToken: string }> {
    const response = await this.plaidApi.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Ledger',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return { linkToken: response.data.link_token };
  }

  async exchangePublicToken(
    publicToken: string,
  ): Promise<{ accessToken: string; itemId: string }> {
    const response = await this.plaidApi.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  }

  async getAccounts(accessToken: string): Promise<PlaidAccountData[]> {
    const response = await this.plaidApi.accountsGet({
      access_token: accessToken,
    });

    return response.data.accounts.map((account) => ({
      accountId: account.account_id,
      name: account.name,
      officialName: account.official_name ?? null,
      mask: account.mask ?? null,
      type: account.type,
      subtype: account.subtype ?? null,
      availableBalance: account.balances.available ?? null,
      currentBalance: account.balances.current ?? null,
      currencyCode: account.balances.iso_currency_code ?? null,
    }));
  }

  async syncTransactions(
    accessToken: string,
    cursor?: string,
  ): Promise<PlaidSyncResult> {
    const response = await this.plaidApi.transactionsSync({
      access_token: accessToken,
      cursor: cursor || undefined,
      options: {
        include_personal_finance_category: true,
      },
    });

    const data = response.data;

    return {
      added: data.added,
      modified: data.modified,
      removed: data.removed
        .map((t) => t.transaction_id)
        .filter((id): id is string => id !== undefined),
      nextCursor: data.next_cursor,
      hasMore: data.has_more,
    };
  }
  async itemRemove(accessToken: string): Promise<void> {
    await this.plaidApi.itemRemove({ access_token: accessToken });
  }
}

export { PlaidClientService };
