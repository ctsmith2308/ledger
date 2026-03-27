import { cookies } from 'next/headers';

type ResolveCookies = typeof cookies;

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

const getCookieCurry = (cookies: ResolveCookies) => async () => {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
};

const setCookieCurry =
  (cookies: ResolveCookies) => async (sessionId: string) => {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(process.env.SESSION_DURATION_SECONDS ?? 604800),
    });
  };

const deleteCookieCurry = (cookies: ResolveCookies) => async () => {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
};

const getCookie = getCookieCurry(cookies);

const setCookie = setCookieCurry(cookies);

const deleteCookie = deleteCookieCurry(cookies);

export {
  getCookie,
  setCookie,
  deleteCookie,
  getCookieCurry,
  setCookieCurry,
  deleteCookieCurry,
};
