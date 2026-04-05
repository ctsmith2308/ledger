import { z } from 'zod';

const unlinkBankSchema = z.object({
  plaidItemId: z.string().min(1),
});

type UnlinkBankInput = z.infer<typeof unlinkBankSchema>;

export { unlinkBankSchema, type UnlinkBankInput };
