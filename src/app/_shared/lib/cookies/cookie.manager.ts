import { cookies } from 'next/headers';

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
};

/**
 * Generic cookie CRUD via next/headers. Thin wrapper over the
 * Next.js cookie store — no domain knowledge, no auth logic.
 * Consumers (AuthManager, etc.) use this for all cookie operations
 * so cookie access is centralized and testable at a higher layer.
 *
 * https://nextjs.org/docs/app/api-reference/functions/cookies
 */
const CookieManager = {
  async get(name: string): Promise<string | null> {
    const cookieStore = await cookies();

    return cookieStore.get(name)?.value ?? null;
  },

  async set(
    name: string,
    value: string,
    options: CookieOptions,
  ): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(name, value, options);
  },

  async remove(name: string): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.delete(name);
  },
};

export { CookieManager, type CookieOptions };
