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
  maxAge: 1020, // 17 minutes — outlives the 15m JWT TTL so the proxy sees expired tokens
} as const;

const SESSION_ID_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 604800, // 60 (sec) * 60 (min) * 24 (hrs) * 7 (days)
} as const;

const AUTH_HEADERS = {
  USER_ID: 'x-user-id',
  SESSION_ID: 'x-session-id',
} as const;

export {
  ACCESS_TOKEN,
  SESSION_ID,
  COOKIE_OPTIONS,
  ACCESS_TOKEN_OPTIONS,
  SESSION_ID_OPTIONS,
  AUTH_HEADERS,
};
