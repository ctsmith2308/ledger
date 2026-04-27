'use client';

import { useState } from 'react';

import { Pencil } from 'lucide-react';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import { DemoFootnote } from '@/app/_widgets';

import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/app/_components';

import { useUpdateProfileForm, type UpdateProfileFormApi } from '../hooks';

function UpdateProfileForm({
  initial,
}: {
  initial: { firstName: string; lastName: string };
}) {
  const { form, formId, isPending, onConfirm } = useUpdateProfileForm(initial);
  const [editOpen, setEditOpen] = useState(false);
  const { isDisabled } = useFeatureFlags();
  const accountWriteDisabled = isDisabled(FEATURE_KEYS.ACCOUNT_WRITE);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    onConfirm();
    setConfirmOpen(false);
    setEditOpen(false);
  };

  return (
    <>
      {/* Read-only card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>

          <CardAction>
            <Dialog
              open={editOpen}
              onOpenChange={(value) => setEditOpen(value)}
            >
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={accountWriteDisabled}
                  />
                }
              >
                <Pencil className="size-3" />
                Edit
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>

                  <DialogDescription>Update your name below.</DialogDescription>
                </DialogHeader>

                <form id={formId} onSubmit={handleSubmit}>
                  <FieldGroup>
                    <FirstNameField form={form} />

                    <LastNameField form={form} />
                  </FieldGroup>
                </form>

                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>

                  <Button type="submit" form={formId} disabled={isPending}>
                    {isPending && <Spinner />}
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>First name</FieldLabel>

              <Input value={initial.firstName} disabled />
            </Field>

            <Field>
              <FieldLabel>Last name</FieldLabel>

              <Input value={initial.lastName} disabled />
            </Field>
          </div>
        </CardContent>
      </Card>

      <DemoFootnote action="Profile editing" disabled={accountWriteDisabled} />

      {/* Confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(value) => setConfirmOpen(value)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confirm changes</DialogTitle>

            <DialogDescription>
              Are you sure you want to update your profile?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>

            <Button disabled={isPending} onClick={handleConfirm}>
              {isPending && <Spinner />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FirstNameField({ form }: { form: UpdateProfileFormApi }) {
  return (
    <form.Field name="firstName">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>First name</FieldLabel>

            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

function LastNameField({ form }: { form: UpdateProfileFormApi }) {
  return (
    <form.Field name="lastName">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Last name</FieldLabel>

            <Input
              id={field.name}
              name={field.name}
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

export { UpdateProfileForm };
