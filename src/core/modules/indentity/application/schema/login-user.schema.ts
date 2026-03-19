import { z } from 'zod';

const loginUserSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type LoginUserInput = z.infer<typeof loginUserSchema>;

export { loginUserSchema, type LoginUserInput };
