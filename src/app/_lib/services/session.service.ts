import { cookies } from 'next/headers';
import { Result, UnauthorizedException } from '@/core/shared/domain';
import { JwtService } from '@/core/shared/infrastructure';

// We define the config here so it's consistent across the app
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

const SessionService = {
  async get() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return Result.fail(new UnauthorizedException());

    return await JwtService.verify(token);
  },

  async set(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Set this to match your JWT expiry (e.g., 7 days)
      maxAge: 60 * 60 * 24 * 7,
    });
  },

  async delete() {
    const cookieStore = await cookies();

    cookieStore.delete(SESSION_COOKIE_NAME);
  },

  async verify(token: string) {
    return await JwtService.verify(token);
  },
};

export { SessionService };
