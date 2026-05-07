import { describe, it, expect, vi } from 'vitest';

import { VerifyMfaLoginHandler } from '../verify-mfa-login.handler';
import { VerifyMfaLoginCommand } from '../verify-mfa-login.command';

import {
  type IUserRepository,
  type IUserSessionRepository,
  type ITotpService,
  User,
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

import {
  type IEventBus,
  type IIdGenerator,
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

const _makeMfaUser = () =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    true,
    'TOTP_SECRET',
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  sessionRepository?: Partial<IUserSessionRepository>;
  eventBus?: Partial<IEventBus>;
  totpService?: Partial<ITotpService>;
  idGenerator?: Partial<IIdGenerator>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeMfaUser()),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const sessionRepository: IUserSessionRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    revokeById: vi.fn(),
    revokeAllForUser: vi.fn(),
    ...overrides.sessionRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const totpService: ITotpService = {
    generateSecret: vi.fn(),
    generateQrDataUrl: vi.fn(),
    verify: vi.fn().mockReturnValue(true),
    ...overrides.totpService,
  };

  const idGenerator: IIdGenerator = {
    generate: vi.fn().mockReturnValue('session-id-123'),
    ...overrides.idGenerator,
  };

  const handler = new VerifyMfaLoginHandler(
    userRepository,
    sessionRepository,
    eventBus,
    totpService,
    idGenerator,
  );

  return {
    handler,
    userRepository,
    sessionRepository,
    eventBus,
    totpService,
    idGenerator,
  };
};

describe('VerifyMfaLoginHandler', () => {
  const validCommand = new VerifyMfaLoginCommand('user-12345', '123456');

  describe('success path', () => {
    it('verifies the TOTP code against the stored secret', async () => {
      const { handler, totpService } = _makeHandler();

      await handler.execute(validCommand);

      expect(totpService.verify).toHaveBeenCalledWith(
        'TOTP_SECRET',
        '123456',
      );
    });

    it('dispatches domain events after login', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });

    it('returns SUCCESS with the user on success', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.type).toBe('SUCCESS');
      expect(result.value.user).toBeInstanceOf(User);
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

    it('fails when user has no mfaSecret', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(_makeUser()),
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

    it('does not dispatch events on failure', async () => {
      const { handler, eventBus } = _makeHandler({
        totpService: { verify: vi.fn().mockReturnValue(false) },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });

  });
});
