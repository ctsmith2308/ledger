import { cookies } from 'next/headers';
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

class CookieService {
  private constructor(
    private readonly store: Awaited<ReturnType<typeof cookies>>,
  ) {}

  static async create(): Promise<CookieService> {
    return new CookieService(await cookies());
  }

  get(name: string): string | undefined {
    return this.store.get(name)?.value;
  }

  set(
    name: string,
    value: string,
    options?: Partial<ResponseCookie>,
  ): void {
    this.store.set(name, value, options);
  }
}

export { CookieService };
