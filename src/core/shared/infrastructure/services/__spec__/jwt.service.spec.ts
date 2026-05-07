import { describe, it, expect } from 'vitest';

import { JWT_TYPE } from '@/core/shared/domain';

import { JwtService } from '../jwt.service.impl';

describe('JwtService', () => {
  describe('signAccess', () => {
    it('returns a signed token string', async () => {
      const token = await JwtService.signAccess('user-123');

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('signChallenge', () => {
    it('returns a signed token string', async () => {
      const token = await JwtService.signChallenge('user-123');

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verify', () => {
    it('returns payload for a valid access token', async () => {
      const token = await JwtService.signAccess('user-123');

      const payload = await JwtService.verify(token, JWT_TYPE.ACCESS);

      expect(payload.sub).toBe('user-123');
    });

    it('returns payload for a valid challenge token', async () => {
      const token = await JwtService.signChallenge('user-456');

      const payload = await JwtService.verify(token, JWT_TYPE.MFA_CHALLENGE);

      expect(payload.sub).toBe('user-456');
    });

    it('throws InvalidJwtException for wrong type', async () => {
      const token = await JwtService.signChallenge('user-123');

      await expect(
        JwtService.verify(token, JWT_TYPE.ACCESS),
      ).rejects.toThrow('Jwt failed');
    });

    it('throws InvalidJwtException for tampered token', async () => {
      const token = await JwtService.signAccess('user-123');
      const tampered = token.slice(0, -5) + 'xxxxx';

      await expect(
        JwtService.verify(tampered, JWT_TYPE.ACCESS),
      ).rejects.toThrow('Jwt failed');
    });

    it('throws InvalidJwtException for empty token', async () => {
      await expect(
        JwtService.verify('', JWT_TYPE.ACCESS),
      ).rejects.toThrow('Jwt failed');
    });
  });
});
