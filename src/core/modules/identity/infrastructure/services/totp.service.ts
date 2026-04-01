import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

import { type ITotpService } from '@/core/modules/identity/domain';

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

    const delta = totp.validate({ token: code, window: 1 });

    return delta !== null;
  },
};

export { TotpService };
