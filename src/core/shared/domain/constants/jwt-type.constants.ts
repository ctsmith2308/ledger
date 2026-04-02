const JWT_TYPE = {
  ACCESS: 'access',
  MFA_CHALLENGE: 'mfa_challenge',
} as const;

type JwtType = (typeof JWT_TYPE)[keyof typeof JWT_TYPE];

export { JWT_TYPE, type JwtType };
