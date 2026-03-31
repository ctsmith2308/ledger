import { z } from 'zod';

const updateBudgetSchema = z.object({
  budgetId: z.string().min(1),
  monthlyLimit: z.number().positive(),
});

type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export { updateBudgetSchema, type UpdateBudgetInput };
