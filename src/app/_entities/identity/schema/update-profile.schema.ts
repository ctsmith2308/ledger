import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required.')
    .max(30, 'First name must be at most 30 characters.'),
  lastName: z
    .string()
    .min(1, 'Last name is required.')
    .max(30, 'Last name must be at most 30 characters.'),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export { updateProfileSchema, type UpdateProfileInput };
