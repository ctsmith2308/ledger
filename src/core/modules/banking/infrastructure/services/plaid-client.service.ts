import {
  PlaidApi,
  Configuration,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid';

import { PlaidErrorException } from '@/core/shared/domain';

import {
  IPlaidClient,
  PlaidAccountData,
  PlaidSyncResult,
} from '@/core/modules/banking/domain';

type AxiosPlaidError = {
  response: {
    data: {
      error_type: string;
      error_code: string;
      error_message: string;
    };
  };
};

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

  /**
   * POST /link/token/create
   * Generates a short-lived link_token used to initialize a Plaid Link
   * session on the client. The link_token scopes the session to this user
   * and the requested products (Transactions).
   * https://plaid.com/docs/api/link/#linktokencreate
   */
  async createLinkToken(userId: string): Promise<{ linkToken: string }> {
    try {
      const response = await this.plaidApi.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Ledger',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      });

      return { linkToken: response.data.link_token };
    } catch (error) {
      const { error_type, error_code, error_message } =
        (error as AxiosPlaidError).response.data;

      throw new PlaidErrorException(
        `[${error_type}] ${error_code}: ${error_message}`,
      );
    }
  }

  /**
   * POST /item/public_token/exchange
   * Converts the public_token from a completed Link session into a
   * permanent access_token for API calls. The public_token is single-use
   * and expires after 30 minutes.
   * https://plaid.com/docs/api/items/#itempublic_tokenexchange
   */
  async exchangePublicToken(
    publicToken: string,
  ): Promise<{ accessToken: string; itemId: string }> {
    try {
      const response = await this.plaidApi.itemPublicTokenExchange({
        public_token: publicToken,
      });

      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
      };
    } catch (error) {
      const { error_type, error_code, error_message } =
        (error as AxiosPlaidError).response.data;

      throw new PlaidErrorException(
        `[${error_type}] ${error_code}: ${error_message}`,
      );
    }
  }

  /**
   * POST /accounts/get
   * Returns active accounts (not closed, capable of carrying a balance)
   * for a linked Item. Balances reflect the last successful update, not
   * real-time values.
   * https://plaid.com/docs/api/accounts/#accountsget
   */
  async getAccounts(accessToken: string): Promise<PlaidAccountData[]> {
    try {
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
    } catch (error) {
      const { error_type, error_code, error_message } =
        (error as AxiosPlaidError).response.data;

      throw new PlaidErrorException(
        `[${error_type}] ${error_code}: ${error_message}`,
      );
    }
  }

  /**
   * POST /transactions/sync
   * Cursor-based incremental sync. Returns added/modified/removed
   * transactions since the last cursor. Paginate by calling again with
   * next_cursor until has_more is false. Modified transactions include
   * the full updated object. Removed transactions are IDs only.
   * https://plaid.com/docs/api/products/transactions/#transactionssync
   */
  async syncTransactions(
    accessToken: string,
    cursor?: string,
  ): Promise<PlaidSyncResult> {
    try {
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
    } catch (error) {
      const { error_type, error_code, error_message } =
        (error as AxiosPlaidError).response.data;

      throw new PlaidErrorException(
        `[${error_type}] ${error_code}: ${error_message}`,
      );
    }
  }

  /**
   * POST /item/remove
   * Removes the Item from Plaid. The access_token is permanently
   * invalidated and can no longer be used for any API calls.
   * https://plaid.com/docs/api/items/#itemremove
   */
  async itemRemove(accessToken: string): Promise<void> {
    try {
      await this.plaidApi.itemRemove({ access_token: accessToken });
    } catch (error) {
      const { error_type, error_code, error_message } =
        (error as AxiosPlaidError).response.data;

      throw new PlaidErrorException(
        `[${error_type}] ${error_code}: ${error_message}`,
      );
    }
  }
}

export { PlaidClientService };
