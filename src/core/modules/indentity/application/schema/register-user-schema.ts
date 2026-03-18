import { z } from 'zod';

const registerUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export { registerUserSchema };
