import { z } from 'zod';

const getSpendingSchema = z.object({
  month: z.string(),
});

type GetSpendingInput = z.infer<typeof getSpendingSchema>;

export { getSpendingSchema, type GetSpendingInput };
