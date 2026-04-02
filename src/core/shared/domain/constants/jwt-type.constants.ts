const JWT_TYPE = {
  ACCESS: 'access',
  MFA_CHALLENGE: 'mfa_challenge',
} as const;

const JWT_TTL = {
  ACCESS: '15m',
  MFA_CHALLENGE: '5m',
} as const;

type JwtType = (typeof JWT_TYPE)[keyof typeof JWT_TYPE];

export { JWT_TYPE, JWT_TTL, type JwtType };
