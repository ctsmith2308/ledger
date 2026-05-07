const ACCESS_TOKEN = 'access_token';

const SESSION_ID = 'session_id';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const;

const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 900,
} as const;

const SESSION_ID_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 604800,
} as const;

export {
  ACCESS_TOKEN,
  SESSION_ID,
  COOKIE_OPTIONS,
  ACCESS_TOKEN_OPTIONS,
  SESSION_ID_OPTIONS,
};
