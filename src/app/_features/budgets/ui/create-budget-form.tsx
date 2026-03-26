'use client';

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/app/_components';

import {
  useCreateBudgetForm,
  type CreateBudgetFormApi,
} from '../hooks';

function CreateBudgetForm() {
  const { form, formId, isPending } = useCreateBudgetForm();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
      <h3 className="mb-4 text-sm font-semibold text-zinc-900">
        Create Budget
      </h3>

      <form id={formId} onSubmit={handleSubmit}>
        <FieldGroup>
          <CategoryField form={form} />
          <MonthlyLimitField form={form} />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner />}
            Create Budget
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

function CategoryField({ form }: { form: CreateBudgetFormApi }) {
  return (
    <form.Field name="category">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Category</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="e.g. FOOD_AND_DRINK"
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

function MonthlyLimitField({ form }: { form: CreateBudgetFormApi }) {
  return (
    <form.Field name="monthlyLimit">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Monthly Limit</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              type="number"
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="500.00"
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

export { CreateBudgetForm };
