'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { FEATURE_KEYS, TRANSACTION_CATEGORY_LIST } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

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

import { useCreateBudgetForm, type CreateBudgetFormApi } from '../hooks';

function CreateBudgetButton() {
  const [open, setOpen] = useState(false);
  const { form, formId, isPending } = useCreateBudgetForm(() => setOpen(false));
  const { isDisabled } = useFeatureFlags();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" disabled={isDisabled(FEATURE_KEYS.BUDGET_WRITE)} />
        }
      >
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
                {TRANSACTION_CATEGORY_LIST.map((cat) => (
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
