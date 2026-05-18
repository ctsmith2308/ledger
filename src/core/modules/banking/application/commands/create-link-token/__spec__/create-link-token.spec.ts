import { describe, it, expect, vi } from 'vitest';

import { PlaidErrorException } from '@/core/shared/domain';

import { type IPlaidClient } from '@/core/modules/banking/domain';

import { CreateLinkTokenHandler } from '../create-link-token.handler';
import { CreateLinkTokenCommand } from '../create-link-token.command';

const _makeHandler = (
  overrides: {
    plaidClient?: Partial<IPlaidClient>;
  } = {},
) => {
  const plaidClient: IPlaidClient = {
    createLinkToken: vi
      .fn()
      .mockResolvedValue({ linkToken: 'link-token-abc' }),
    exchangePublicToken: vi.fn(),
    getAccounts: vi.fn(),
    syncTransactions: vi.fn(),
    itemRemove: vi.fn(),
    ...overrides.plaidClient,
  };

  const handler = new CreateLinkTokenHandler(plaidClient);

  return { handler, plaidClient };
};

describe('CreateLinkTokenHandler', () => {
  const validCommand = new CreateLinkTokenCommand('user-1');

  describe('success path', () => {
    it('calls createLinkToken with the command userId', async () => {
      const { handler, plaidClient } = _makeHandler();

      await handler.execute(validCommand);

      expect(plaidClient.createLinkToken).toHaveBeenCalledWith('user-1');
    });

    it('returns the link token on success', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.getValueOrThrow()).toEqual({
        linkToken: 'link-token-abc',
      });
    });
  });

  describe('plaid failure', () => {
    it('fails with PlaidErrorException when createLinkToken throws', async () => {
      const { handler } = _makeHandler({
        plaidClient: {
          createLinkToken: vi
            .fn()
            .mockRejectedValue(new Error('Plaid down')),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PlaidErrorException);
    });
  });
});
