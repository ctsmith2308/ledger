import { describe, it, expect, vi } from 'vitest';

import {
  type IEventBus,
  PlaidErrorException,
} from '@/core/shared/domain';

import {
  type IPlaidClient,
  type IPlaidItemRepository,
  type IBankAccountRepository,
  BankAccountLinkedEvent,
} from '@/core/modules/banking/domain';

import { ExchangePublicTokenHandler } from '../exchange-public-token.handler';
import { ExchangePublicTokenCommand } from '../exchange-public-token.command';

const _plaidAccounts = [
  {
    accountId: 'acct-1',
    name: 'Checking',
    officialName: 'Primary Checking',
    mask: '1234',
    type: 'depository',
    subtype: 'checking',
    availableBalance: 500,
    currentBalance: 600,
    currencyCode: 'USD',
  },
  {
    accountId: 'acct-2',
    name: 'Savings',
    officialName: null,
    mask: null,
    type: 'depository',
    subtype: 'savings',
    availableBalance: null,
    currentBalance: 1000,
    currencyCode: null,
  },
];

const _makeHandler = (
  overrides: {
    plaidClient?: Partial<IPlaidClient>;
    plaidItemRepository?: Partial<IPlaidItemRepository>;
    bankAccountRepository?: Partial<IBankAccountRepository>;
    eventBus?: Partial<IEventBus>;
  } = {},
) => {
  const plaidClient: IPlaidClient = {
    createLinkToken: vi.fn(),
    exchangePublicToken: vi.fn().mockResolvedValue({
      accessToken: 'access-token-xyz',
      itemId: 'item-id-1',
    }),
    getAccounts: vi.fn().mockResolvedValue(_plaidAccounts),
    syncTransactions: vi.fn(),
    itemRemove: vi.fn(),
    ...overrides.plaidClient,
  };

  const plaidItemRepository: IPlaidItemRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    updateCursor: vi.fn(),
    deleteById: vi.fn(),
    ...overrides.plaidItemRepository,
  };

  const bankAccountRepository: IBankAccountRepository = {
    saveMany: vi.fn().mockResolvedValue(undefined),
    findByPlaidItemId: vi.fn(),
    findByUserId: vi.fn(),
    findById: vi.fn(),
    ...overrides.bankAccountRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn().mockResolvedValue(undefined),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new ExchangePublicTokenHandler(
    plaidClient,
    plaidItemRepository,
    bankAccountRepository,
    eventBus,
  );

  return {
    handler,
    plaidClient,
    plaidItemRepository,
    bankAccountRepository,
    eventBus,
  };
};

describe('ExchangePublicTokenHandler', () => {
  const validCommand = new ExchangePublicTokenCommand(
    'user-1',
    'public-token-abc',
  );

  describe('success path', () => {
    it('exchanges the public token via Plaid', async () => {
      const { handler, plaidClient } = _makeHandler();

      await handler.execute(validCommand);

      expect(plaidClient.exchangePublicToken).toHaveBeenCalledWith(
        'public-token-abc',
      );
    });

    it('saves the plaid item to the repository', async () => {
      const { handler, plaidItemRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(plaidItemRepository.save).toHaveBeenCalledTimes(1);
      const savedItem = (
        plaidItemRepository.save as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      expect(savedItem.id).toBe('item-id-1');
      expect(savedItem.userId).toBe('user-1');
      expect(savedItem.accessToken).toBe('access-token-xyz');
    });

    it('fetches accounts using the access token', async () => {
      const { handler, plaidClient } = _makeHandler();

      await handler.execute(validCommand);

      expect(plaidClient.getAccounts).toHaveBeenCalledWith(
        'access-token-xyz',
      );
    });

    it('saves all bank accounts to the repository', async () => {
      const { handler, bankAccountRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(bankAccountRepository.saveMany).toHaveBeenCalledTimes(1);
      const savedAccounts = (
        bankAccountRepository.saveMany as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      expect(savedAccounts).toHaveLength(2);
      expect(savedAccounts[0].id).toBe('acct-1');
      expect(savedAccounts[1].id).toBe('acct-2');
    });

    it('dispatches BankAccountLinkedEvent from the plaid item', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
      const [dispatched] = (eventBus.dispatch as ReturnType<typeof vi.fn>)
        .mock.calls[0];
      expect(dispatched).toHaveLength(1);
      expect(dispatched[0]).toBeInstanceOf(BankAccountLinkedEvent);
      expect(dispatched[0].aggregateId).toBe('item-id-1');
      expect(dispatched[0].userId).toBe('user-1');
    });

    it('returns the plaid item as the success value', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      const plaidItem = result.getValueOrThrow();
      expect(plaidItem.id).toBe('item-id-1');
      expect(plaidItem.userId).toBe('user-1');
    });

    it('handles accounts with null optional fields', async () => {
      const { handler, bankAccountRepository } = _makeHandler();

      await handler.execute(validCommand);

      const savedAccounts = (
        bankAccountRepository.saveMany as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      const savingsAccount = savedAccounts[1];
      expect(savingsAccount.id).toBe('acct-2');
      expect(savingsAccount.name).toBe('Savings');
    });
  });

  describe('plaid exchangePublicToken failure', () => {
    it('fails with PlaidErrorException when exchangePublicToken throws', async () => {
      const { handler } = _makeHandler({
        plaidClient: {
          exchangePublicToken: vi
            .fn()
            .mockRejectedValue(new Error('Plaid down')),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PlaidErrorException);
    });

    it('does not save anything when exchangePublicToken fails', async () => {
      const { handler, plaidItemRepository, bankAccountRepository, eventBus } =
        _makeHandler({
          plaidClient: {
            exchangePublicToken: vi
              .fn()
              .mockRejectedValue(new Error('Plaid down')),
          },
        });

      await handler.execute(validCommand);

      expect(plaidItemRepository.save).not.toHaveBeenCalled();
      expect(bankAccountRepository.saveMany).not.toHaveBeenCalled();
      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('plaid getAccounts failure', () => {
    it('fails with PlaidErrorException when getAccounts throws', async () => {
      const { handler } = _makeHandler({
        plaidClient: {
          getAccounts: vi
            .fn()
            .mockRejectedValue(new Error('Account fetch failed')),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PlaidErrorException);
    });

    it('does not save bank accounts or dispatch events when getAccounts fails', async () => {
      const { handler, bankAccountRepository, eventBus } = _makeHandler({
        plaidClient: {
          getAccounts: vi
            .fn()
            .mockRejectedValue(new Error('Account fetch failed')),
        },
      });

      await handler.execute(validCommand);

      expect(bankAccountRepository.saveMany).not.toHaveBeenCalled();
      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });
});
