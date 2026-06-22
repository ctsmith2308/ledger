import { describe, it, expect } from 'vitest';

import { PlaidItem } from '../plaid-item.aggregate';
import { BankAccountLinkedEvent } from '../../events';

describe('PlaidItem', () => {
  describe('create', () => {
    it('creates a plaid item with the given values and no cursor', () => {
      const before = new Date();

      const item = PlaidItem.create(
        'item-1',
        'user-1',
        'access-token-xyz',
        'ins_1',
      );

      const after = new Date();

      expect(item.id).toBe('item-1');
      expect(item.userId).toBe('user-1');
      expect(item.accessToken).toBe('access-token-xyz');
      expect(item.institutionId).toBe('ins_1');
      expect(item.cursor).toBeUndefined();

      expect(item.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(item.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('raises BankAccountLinkedEvent with the correct data', () => {
      const item = PlaidItem.create(
        'item-1',
        'user-1',
        'access-token-xyz',
        'ins_1',
      );

      const events = item.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(BankAccountLinkedEvent);

      const event = events[0] as BankAccountLinkedEvent;
      expect(event.aggregateId).toBe('item-1');
      expect(event.userId).toBe('user-1');
      expect(event.institutionId).toBe('ins_1');
    });

    it('allows institutionId to be undefined in both the item and the event', () => {
      const item = PlaidItem.create('item-1', 'user-1', 'access-token-xyz');

      expect(item.institutionId).toBeUndefined();

      const event = item.pullDomainEvents()[0] as BankAccountLinkedEvent;
      expect(event.institutionId).toBeUndefined();
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a plaid item without raising events', () => {
      const createdAt = new Date('2026-01-01');

      const item = PlaidItem.reconstitute(
        'item-1',
        'user-1',
        'access-token-xyz',
        'ins_1',
        'cursor-abc',
        createdAt,
      );

      expect(item.id).toBe('item-1');
      expect(item.cursor).toBe('cursor-abc');
      expect(item.createdAt).toBe(createdAt);
      expect(item.pullDomainEvents()).toHaveLength(0);
    });

    it('preserves undefined optional fields', () => {
      const item = PlaidItem.reconstitute(
        'item-1',
        'user-1',
        'access-token-xyz',
        undefined,
        undefined,
        new Date(),
      );

      expect(item.institutionId).toBeUndefined();
      expect(item.cursor).toBeUndefined();
    });
  });

  describe('updateCursor', () => {
    it('updates the cursor without raising events', () => {
      const item = PlaidItem.create('item-1', 'user-1', 'access-token-xyz');
      item.pullDomainEvents();

      item.updateCursor('cursor-abc');

      expect(item.cursor).toBe('cursor-abc');
      expect(item.pullDomainEvents()).toHaveLength(0);
    });

    it('overwrites a previous cursor', () => {
      const item = PlaidItem.reconstitute(
        'item-1',
        'user-1',
        'access-token-xyz',
        undefined,
        'old-cursor',
        new Date(),
      );

      item.updateCursor('new-cursor');

      expect(item.cursor).toBe('new-cursor');
    });
  });
});
