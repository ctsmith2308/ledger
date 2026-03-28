'use client';

import {
  Button,
  Card,
  CardAction,
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
  PasswordInput,
  Spinner,
} from '@/app/_components';

import { useRegisterForm, type RegisterFormApi } from '../hooks';

const formType = 'register-account-form';

function RegisterForm() {
  const { form, isPending } = useRegisterForm();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    form.handleSubmit();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create a new account</CardTitle>

        <CardDescription>
          Enter your details below to create a new account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id={formType} onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FirstNameField form={form} />
              <LastNameField form={form} />
            </div>

            <EmailField form={form} />

            <PasswordField form={form} />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Field>
          <Button type="submit" form={formType} disabled={isPending}>
            {isPending && <Spinner />}
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}

function FirstNameField({ form }: { form: RegisterFormApi }) {
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
              placeholder="John"
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

function LastNameField({ form }: { form: RegisterFormApi }) {
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
              placeholder="Doe"
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

function EmailField({ form }: { form: RegisterFormApi }) {
  return (
    <form.Field name="email">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>

            <Input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="m@example.com"
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

function PasswordField({ form }: { form: RegisterFormApi }) {
  return (
    <form.Field name="password">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>

            <PasswordInput
              id={field.name}
              name={field.name}
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

export { RegisterForm };
