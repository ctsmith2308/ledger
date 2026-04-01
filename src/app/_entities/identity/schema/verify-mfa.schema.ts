import { z } from 'zod';

const totpCodeField = z
  .string()
  .length(6, 'Code must be 6 digits.')
  .regex(/^\d{6}$/, 'Code must be numeric.');

const verifyMfaLoginSchema = z.object({
  challengeToken: z.string().min(1),
  totpCode: totpCodeField,
});

const verifyMfaSetupSchema = z.object({
  totpCode: totpCodeField,
});

export { verifyMfaLoginSchema, verifyMfaSetupSchema };
