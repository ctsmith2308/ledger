import { ValueObject } from '@/shared/domain/value-object';

interface EmailProps {
  value: string;
}

class Email extends ValueObject<EmailProps> {
  constructor(email: string) {
    if (!Email.isValid(email)) throw new Error(`Invalid email: ${email}`);

    super({ value: email.toLowerCase() });
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get value(): string {
    return this.props.value;
  }
}

export { Email };
