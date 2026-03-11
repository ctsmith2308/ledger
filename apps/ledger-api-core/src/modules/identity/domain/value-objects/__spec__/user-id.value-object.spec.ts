import { UserId } from '../user-id.value-object';

describe('UserId', () => {
  describe('create()', () => {
    it('should create a UserId with a valid id string', () => {
      const userId = UserId.create('valid-uuid-1234');
      expect(userId.value).toBe('valid-uuid-1234');
    });

    it('should throw for an empty string', () => {
      expect(() => UserId.create('')).toThrow('Invalid User ID format');
    });

    it('should throw for an id shorter than 5 characters', () => {
      expect(() => UserId.create('abc')).toThrow('Invalid User ID format');
    });

    it('should accept a standard uuid v4', () => {
      const uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      expect(() => UserId.create(uuid)).not.toThrow();
      expect(UserId.create(uuid).value).toBe(uuid);
    });
  });

  describe('equals()', () => {
    it('should return true for two UserIds with the same value', () => {
      const a = UserId.create('same-uuid-here');
      const b = UserId.create('same-uuid-here');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different UserIds', () => {
      const a = UserId.create('uuid-one-1234');
      const b = UserId.create('uuid-two-5678');
      expect(a.equals(b)).toBe(false);
    });
  });
});
