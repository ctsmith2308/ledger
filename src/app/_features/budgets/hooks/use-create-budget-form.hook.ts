import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { execute } from '@/app/_lib/safe-action';
import { createBudgetAction } from '../actions';

const formSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  monthlyLimit: z.string().min(1, 'Monthly limit is required.'),
});

const useCreateBudgetForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: { category: string; monthlyLimit: number }) =>
      execute(createBudgetAction(input)),
    onSuccess: () => {
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: { category: '', monthlyLimit: '' },
    validators: { onSubmit: formSchema },
    onSubmit: ({ value }) =>
      mutate({
        category: value.category,
        monthlyLimit: Number(value.monthlyLimit),
      }),
  });

  return { form, formId: 'create-budget-form', isPending };
};

type CreateBudgetFormApi = ReturnType<typeof useCreateBudgetForm>['form'];

export { useCreateBudgetForm, type CreateBudgetFormApi };
