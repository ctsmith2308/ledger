'use client';

import { Plus } from 'lucide-react';

import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Spinner,
} from '@/app/_components';

import { TRANSACTION_CATEGORIES } from '@/app/_entities/transactions';

import { useUserTier } from '@/app/_providers';

import { DemoFootnote } from '@/app/_widgets';

import {
  useCreateBudgetForm,
  type CreateBudgetFormApi,
} from '../hooks';

function CreateBudgetButton() {
  const { form, formId, isPending } = useCreateBudgetForm();
  const { isDemo } = useUserTier();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  if (isDemo) {
    return <DemoFootnote action="Budget creation" />;
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        New budget
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create budget</DialogTitle>

          <DialogDescription>
            Set a monthly spending limit for a category.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit}>
          <FieldGroup>
            <CategoryField form={form} />

            <MonthlyLimitField form={form} />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Spinner />}
              Create budget
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
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
            <FieldLabel>Category</FieldLabel>

            <Select
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
            >
              <SelectTrigger className="w-full" aria-invalid={isInvalid}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>

              <SelectContent>
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replaceAll('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
            <FieldLabel htmlFor={field.name}>Monthly limit</FieldLabel>

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

export { CreateBudgetButton };
