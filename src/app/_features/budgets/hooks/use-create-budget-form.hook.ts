import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import { createBudgetAction } from '@/app/_entities/budgets/actions';
import { type CreateBudgetInput } from '@/app/_entities/budgets/schema';

import { createBudgetFormSchema } from '../schema/create-budget-form.schema';

const useCreateBudgetForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      execute(createBudgetAction(input)),
    onSuccess: () => {
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: { category: '', monthlyLimit: '' },
    validators: { onSubmit: createBudgetFormSchema },
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
