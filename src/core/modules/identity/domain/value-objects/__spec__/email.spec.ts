import { describe, it, expect } from 'vitest';
import { Email } from '../user/email.value-object';
import { InvalidEmailException } from '@/core/shared/domain';

describe('Email', () => {
  describe('create', () => {
    it('succeeds with a valid email', () => {
      const result = Email.create('User@Example.com');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('user@example.com');
    });

    it('trims whitespace', () => {
      const result = Email.create('  test@example.com  ');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('test@example.com');
    });

    it('lowercases the email', () => {
      const result = Email.create('TEST@DOMAIN.COM');

      expect(result.value.value).toBe('test@domain.com');
    });

    it('fails for empty string', () => {
      const result = Email.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails for missing @ symbol', () => {
      const result = Email.create('invalidemail.com');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails for missing domain', () => {
      const result = Email.create('user@');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails for missing TLD', () => {
      const result = Email.create('user@domain');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails for null-like input', () => {
      const result = Email.create(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails for undefined-like input', () => {
      const result = Email.create(undefined as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });
  });

  describe('from', () => {
    it('creates an Email without validation', () => {
      const email = Email.from('stored@db.com');

      expect(email.value).toBe('stored@db.com');
    });
  });

  describe('equals', () => {
    it('returns true for equal emails', () => {
      const a = Email.create('same@email.com').value;
      const b = Email.create('same@email.com').value;

      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different emails', () => {
      const a = Email.create('a@email.com').value;
      const b = Email.create('b@email.com').value;

      expect(a.equals(b)).toBe(false);
    });
  });
});
