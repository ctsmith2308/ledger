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
  Spinner,
} from '@/app/_components';

import { useRegisterForm, type RegisterFormApi } from '../hooks';

// type RegisterFormApi = ReturnType<typeof useRegisterForm>['registerForm'];

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
          Enter your email below to create a new account
        </CardDescription>

        <CardAction>
          <Button variant="link">Sign in</Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <form id={formType} onSubmit={handleSubmit}>
          <FieldGroup>
            {/** Email Field */}
            <EmailField form={form} />

            {/** Password Field */}
            <PasswordField form={form} />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Field>
          {/** Submit Button */}
          <Button type="submit" form={formType} disabled={isPending}>
            {isPending && <Spinner />}
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
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
            {/* Email Label */}
            <FieldLabel htmlFor={field.name}>Email</FieldLabel>

            {/* Email Input */}
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

            {/* Email Validation Error*/}
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
            {/* Password Label */}
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>

            {/* Password Input */}
            <Input
              id={field.name}
              name={field.name}
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
            />

            {/* Password Validation Error  */}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}

export { RegisterForm };
