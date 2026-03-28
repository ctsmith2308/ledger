import { z } from 'zod';

import { firstNameField, lastNameField } from './fields';

const updateProfileSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export { updateProfileSchema, type UpdateProfileInput };
