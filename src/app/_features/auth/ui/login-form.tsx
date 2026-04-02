'use client';

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

import { useLoginForm, type LoginFormApi, type DemoUser } from '../hooks';

function LoginForm() {
  const { form, formId, isPending, selectedUser, selectUser, demoUsers } =
    useLoginForm();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Select a demo account
        </p>

        <div className="grid gap-2">
          {demoUsers.map((user) => (
            <UserCard
              key={user.email}
              user={user}
              isSelected={selectedUser?.email === user.email}
              onSelect={() => selectUser(user)}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>

          <CardDescription>
            Select a user above to autofill credentials
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id={formId} onSubmit={handleSubmit}>
            <FieldGroup>
              <EmailField form={form} />

              <PasswordField form={form} />
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Field>
            <Button
              type="submit"
              form={formId}
              disabled={isPending}
            >
              {isPending && <Spinner />}
              Login
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
}

function UserCard({
  user,
  isSelected,
  onSelect,
}: {
  user: DemoUser;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950'
          : 'border-border bg-card hover:border-muted-foreground'
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          {user.name[0]}
        </span>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">{user.name}</p>

        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </button>
  );
}

function EmailField({ form }: { form: LoginFormApi }) {
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

function PasswordField({ form }: { form: LoginFormApi }) {
  return (
    <form.Field name="password">
      {(field) => {
        const isInvalid =
          field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>Password</FieldLabel>

            <Input
              id={field.name}
              name={field.name}
              type="password"
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

export { LoginForm };
