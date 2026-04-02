import { describe, it, expect, vi } from 'vitest';

import { VerifyMfaSetupHandler } from '../verify-mfa-setup.handler';
import { VerifyMfaSetupCommand } from '../verify-mfa-setup.command';

import {
  type IUserRepository,
  type ITotpService,
  User,
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

import {
  type IEventBus,
  UserNotFoundException,
  InvalidMfaCodeException,
} from '@/core/shared/domain';

const _makeUser = (opts?: { mfaEnabled?: boolean }) =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    opts?.mfaEnabled ?? false,
    opts?.mfaEnabled ? 'TOTP_SECRET' : undefined,
  );

const _makeUserWithSecret = () =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    false,
    'TOTP_SECRET',
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  totpService?: Partial<ITotpService>;
  eventBus?: Partial<IEventBus>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeUserWithSecret()),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const totpService: ITotpService = {
    generateSecret: vi.fn(),
    generateQrDataUrl: vi.fn(),
    verify: vi.fn().mockReturnValue(true),
    ...overrides.totpService,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new VerifyMfaSetupHandler(
    userRepository,
    totpService,
    eventBus,
  );

  return { handler, userRepository, totpService, eventBus };
};

describe('VerifyMfaSetupHandler', () => {
  const validCommand = new VerifyMfaSetupCommand('user-12345', '123456');

  describe('success path', () => {
    it('verifies the TOTP code against the stored secret', async () => {
      const { handler, totpService } = _makeHandler();

      await handler.execute(validCommand);

      expect(totpService.verify).toHaveBeenCalledWith(
        'TOTP_SECRET',
        '123456',
      );
    });

    it('saves the user after confirming MFA', async () => {
      const { handler, userRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('dispatches domain events', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });

    it('returns the user on success', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(User);
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

    it('fails when user has no mfaSecret set', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(_makeUser()),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidMfaCodeException);
    });

    it('fails when mfaEnabled is already true', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi
            .fn()
            .mockResolvedValue(_makeUser({ mfaEnabled: true })),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidMfaCodeException);
    });

    it('fails when TOTP code is invalid', async () => {
      const { handler } = _makeHandler({
        totpService: { verify: vi.fn().mockReturnValue(false) },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidMfaCodeException);
    });

    it('does not save user when TOTP code is invalid', async () => {
      const { handler, userRepository } = _makeHandler({
        totpService: { verify: vi.fn().mockReturnValue(false) },
      });

      await handler.execute(validCommand);

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('does not dispatch events on failure', async () => {
      const { handler, eventBus } = _makeHandler({
        totpService: { verify: vi.fn().mockReturnValue(false) },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });
});
