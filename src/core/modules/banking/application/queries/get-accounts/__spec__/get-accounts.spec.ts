import { describe, it, expect, vi } from 'vitest';

import {
  type IBankAccountRepository,
  BankAccount,
} from '@/core/modules/banking/domain';

import { GetAccountsHandler } from '../get-accounts.handler';
import { GetAccountsQuery } from '../get-accounts.query';

const _bankAccount = (id: string) =>
  BankAccount.reconstitute(
    id,
    'plaid-item-1',
    'Checking',
    undefined,
    undefined,
    'depository',
    'checking',
    100,
    100,
    'USD',
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

const _makeHandler = (
  overrides: {
    bankAccountRepository?: Partial<IBankAccountRepository>;
  } = {},
) => {
  const bankAccountRepository: IBankAccountRepository = {
    saveMany: vi.fn(),
    findByPlaidItemId: vi.fn(),
    findByUserId: vi
      .fn()
      .mockResolvedValue([_bankAccount('acc-1'), _bankAccount('acc-2')]),
    findById: vi.fn(),
    ...overrides.bankAccountRepository,
  };

  const handler = new GetAccountsHandler(bankAccountRepository);

  return { handler, bankAccountRepository };
};

describe('GetAccountsHandler', () => {
  const validQuery = new GetAccountsQuery('user-1');

  describe('success path', () => {
    it('calls findByUserId with the query userId', async () => {
      const { handler, bankAccountRepository } = _makeHandler();

      await handler.execute(validQuery);

      expect(bankAccountRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('returns all bank accounts for the user', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validQuery);

      expect(result.isSuccess).toBe(true);
      const accounts = result.getValueOrThrow();
      expect(accounts).toHaveLength(2);
      expect(accounts[0].id).toBe('acc-1');
      expect(accounts[1].id).toBe('acc-2');
    });
  });

  describe('no accounts', () => {
    it('returns an empty array when the user has no bank accounts', async () => {
      const { handler } = _makeHandler({
        bankAccountRepository: {
          findByUserId: vi.fn().mockResolvedValue([]),
        },
      });

      const result = await handler.execute(validQuery);

      expect(result.isSuccess).toBe(true);
      expect(result.getValueOrThrow()).toEqual([]);
    });
  });
});
