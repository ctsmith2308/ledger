interface ITotpService {
  generateSecret(): string;
  generateQrDataUrl(secret: string, email: string): Promise<string>;
  verify(secret: string, code: string): boolean;
}

export { type ITotpService };
