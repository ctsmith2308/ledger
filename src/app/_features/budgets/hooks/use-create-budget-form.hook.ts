import { useForm } from '@tanstack/react-form';

import { useQueryClient, useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { createBudgetAction } from '@/app/_entities/budgets/actions';

import { type CreateBudgetInput } from '@/app/_entities/budgets/schema';

import { createBudgetFormSchema } from '../schema/create-budget-form.schema';

const useCreateBudgetForm = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      handleActionResponse(createBudgetAction(input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetOverview });
      onSuccess?.();
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
