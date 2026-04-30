import { describe, it, expect, vi, afterEach } from 'vitest';

import { BankAccount } from '../bank-account.aggregate';

describe('BankAccount', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('creates an account with the given values, timestamps set to now, and no events', () => {
      const before = new Date();

      const account = BankAccount.create(
        'acct-1',
        'item-1',
        'Checking',
        'Primary Checking',
        '1234',
        'depository',
        'checking',
        500,
        600,
        'USD',
      );

      const after = new Date();

      expect(account.id).toBe('acct-1');
      expect(account.plaidItemId).toBe('item-1');
      expect(account.name).toBe('Checking');
      expect(account.officialName).toBe('Primary Checking');
      expect(account.mask).toBe('1234');
      expect(account.type).toBe('depository');
      expect(account.subtype).toBe('checking');
      expect(account.availableBalance).toBe(500);
      expect(account.currentBalance).toBe(600);
      expect(account.currencyCode).toBe('USD');

      expect(account.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(account.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(account.updatedAt.getTime()).toEqual(account.createdAt.getTime());

      expect(account.pullDomainEvents()).toHaveLength(0);
    });

    it('accepts undefined for optional fields', () => {
      const account = BankAccount.create(
        'acct-1',
        'item-1',
        'Savings',
        undefined,
        undefined,
        'depository',
        undefined,
        undefined,
        undefined,
        'USD',
      );

      expect(account.officialName).toBeUndefined();
      expect(account.mask).toBeUndefined();
      expect(account.subtype).toBeUndefined();
      expect(account.availableBalance).toBeUndefined();
      expect(account.currentBalance).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('rebuilds an account with persisted timestamps and no events', () => {
      const createdAt = new Date('2026-01-01');
      const updatedAt = new Date('2026-02-15');

      const account = BankAccount.reconstitute(
        'acct-1',
        'item-1',
        'Checking',
        'Primary Checking',
        '1234',
        'depository',
        'checking',
        500,
        600,
        'USD',
        createdAt,
        updatedAt,
      );

      expect(account.id).toBe('acct-1');
      expect(account.createdAt).toBe(createdAt);
      expect(account.updatedAt).toBe(updatedAt);
      expect(account.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('updateBalances', () => {
    it('updates balances and advances updatedAt without raising events', () => {
      vi.useFakeTimers();
      const createTime = new Date('2026-01-01T00:00:00Z');
      vi.setSystemTime(createTime);

      const account = BankAccount.create(
        'acct-1',
        'item-1',
        'Checking',
        undefined,
        undefined,
        'depository',
        undefined,
        500,
        600,
        'USD',
      );

      const updateTime = new Date('2026-01-02T00:00:00Z');
      vi.setSystemTime(updateTime);

      account.updateBalances(1000, 1200);

      expect(account.availableBalance).toBe(1000);
      expect(account.currentBalance).toBe(1200);
      expect(account.updatedAt.getTime()).toBe(updateTime.getTime());
      expect(account.createdAt.getTime()).toBe(createTime.getTime());
      expect(account.pullDomainEvents()).toHaveLength(0);
    });

    it('allows setting balances to undefined', () => {
      const account = BankAccount.create(
        'acct-1',
        'item-1',
        'Checking',
        undefined,
        undefined,
        'depository',
        undefined,
        500,
        600,
        'USD',
      );

      account.updateBalances(undefined, undefined);

      expect(account.availableBalance).toBeUndefined();
      expect(account.currentBalance).toBeUndefined();
    });
  });
});
