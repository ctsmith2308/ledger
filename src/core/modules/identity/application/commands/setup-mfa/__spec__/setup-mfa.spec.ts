import { describe, it, expect, vi } from 'vitest';

import { SetupMfaHandler } from '../setup-mfa.handler';
import { SetupMfaCommand } from '../setup-mfa.command';

import {
  type IUserRepository,
  type ITotpService,
  User,
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

import { UserNotFoundException } from '@/core/shared/domain';

const _makeUser = (opts?: { mfaEnabled?: boolean }) =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    opts?.mfaEnabled ?? false,
    opts?.mfaEnabled ? 'TOTP_SECRET' : undefined,
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  totpService?: Partial<ITotpService>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeUser()),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const totpService: ITotpService = {
    generateSecret: vi.fn().mockReturnValue('generated-secret'),
    generateQrDataUrl: vi.fn().mockResolvedValue('data:image/png;base64,qr'),
    verify: vi.fn(),
    ...overrides.totpService,
  };

  const handler = new SetupMfaHandler(userRepository, totpService);

  return { handler, userRepository, totpService };
};

describe('SetupMfaHandler', () => {
  const validCommand = new SetupMfaCommand('user-12345');

  describe('success path', () => {
    it('generates a TOTP secret', async () => {
      const { handler, totpService } = _makeHandler();

      await handler.execute(validCommand);

      expect(totpService.generateSecret).toHaveBeenCalledTimes(1);
    });

    it('saves the user with the new secret', async () => {
      const { handler, userRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('generates a QR code data URL', async () => {
      const { handler, totpService } = _makeHandler();

      await handler.execute(validCommand);

      expect(totpService.generateQrDataUrl).toHaveBeenCalledWith(
        'generated-secret',
        'user@example.com',
      );
    });

    it('returns the QR code data URL', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({
        qrCodeDataUrl: 'data:image/png;base64,qr',
      });
    });
  });

  describe('failure paths', () => {
    it('fails when user is not found', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UserNotFoundException);
    });

    it('does not generate a secret when user is not found', async () => {
      const { handler, totpService } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await handler.execute(validCommand);

      expect(totpService.generateSecret).not.toHaveBeenCalled();
    });
  });
});
