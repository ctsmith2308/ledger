import { TOTP, Secret } from 'otpauth';

import QRCode from 'qrcode';

import { type ITotpService } from '@/core/modules/identity/domain';

/**
 * TOTP configuration per RFC 6238. These constants must match what
 * authenticator apps expect. Changing them after users have enrolled
 * will invalidate all existing secrets.
 * https://www.rfc-editor.org/rfc/rfc6238
 */
const ISSUER = 'Ledger';
const ALGORITHM = 'SHA1';
const DIGITS = 6;
const PERIOD = 30;

const TotpService: ITotpService = {
  generateSecret(): string {
    const secret = new Secret({ size: 20 });
    return secret.base32;
  },

  async generateQrDataUrl(secret: string, email: string): Promise<string> {
    const totp = new TOTP({
      issuer: ISSUER,
      label: email,
      algorithm: ALGORITHM,
      digits: DIGITS,
      period: PERIOD,
      secret: Secret.fromBase32(secret),
    });

    const uri = totp.toString();

    return QRCode.toDataURL(uri);
  },

  verify(secret: string, code: string): boolean {
    const totp = new TOTP({
      issuer: ISSUER,
      algorithm: ALGORITHM,
      digits: DIGITS,
      period: PERIOD,
      secret: Secret.fromBase32(secret),
    });

    /** window: 1 allows one time step of drift (30s). Balances usability
     *  (clock skew, slow entry) against security (larger window = larger
     *  attack surface for brute force). */
    const delta = totp.validate({ token: code, window: 1 });

    return delta !== null;
  },
};

export { TotpService };
