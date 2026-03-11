import { UserId } from '../user-id.value-object';
import { InvalidUserIdException } from '@/modules/identity/domain';

describe('UserId', () => {
  describe('create()', () => {
    it('should create a UserId with a valid id string', () => {
      const userId = UserId.create('valid-uuid-1234').value;
      expect(userId.value).toBe('valid-uuid-1234');
    });

    it('should throw for an empty string', () => {
      const result = UserId.create('');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidUserIdException);
    });

    it('should throw for an id shorter than 5 characters', () => {
      const result = UserId.create('123');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidUserIdException);
    });

    it('should accept a standard uuid v4', () => {
      const uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      expect(() => UserId.create(uuid)).not.toThrow();
    });
  });

  describe('equals()', () => {
    it('should return true for two UserIds with the same value', () => {
      const a = UserId.from('same-uuid-here');
      const b = UserId.from('same-uuid-here');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different UserIds', () => {
      const a = UserId.from('uuid-one-1234');
      const b = UserId.from('uuid-two-5678');
      expect(a.equals(b)).toBe(false);
    });
  });
});
