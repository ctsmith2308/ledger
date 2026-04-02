'use client';

import Link from 'next/link';

import { ROUTES } from '@/app/_shared/routes';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/app/_components';

import { useMfaVerifyForm, type MfaVerifyFormApi } from '../hooks';

function MfaVerifyForm() {
  const { form, formId, isPending } = useMfaVerifyForm();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>

        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id={formId} onSubmit={handleSubmit}>
          <FieldGroup>
            <TotpCodeField form={form} />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Field>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending && <Spinner />}
            Verify
          </Button>
        </Field>

        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.login}>Back to login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function TotpCodeField({ form }: { form: MfaVerifyFormApi }) {
  return (
    <form.Field name="totpCode">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Authentication code</FieldLabel>

            <Input
              id={field.name}
              name={field.name}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="000000"
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

export { MfaVerifyForm };
