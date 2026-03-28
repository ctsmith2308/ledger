'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import {
  loginAction,
  loginUserSchema,
  type LoginUserInput,
} from '@/app/_entities/identity';

type DemoUser = {
  name: string;
  email: string;
  password: string;
};

const DEMO_USERS: DemoUser[] = [
  { name: 'Demo User', email: 'demo@ledger.app', password: 'Password@123!' },
  { name: 'Alice Rivera', email: 'alice@ledger.app', password: 'Password@123!' },
  { name: 'Ben Carter', email: 'ben@ledger.app', password: 'Password@123!' },
];

const useDemoLoginForm = () => {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (input: LoginUserInput) =>
      execute(loginAction(input)),
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginUserSchema },
    onSubmit: ({ value }) => mutate(value),
  });

  const selectUser = (user: DemoUser) => {
    setSelectedUser(user);
    form.setFieldValue('email', user.email);
    form.setFieldValue('password', user.password);
  };

  return { form, formId: 'demo-login-form', isPending, selectedUser, selectUser, demoUsers: DEMO_USERS };
};

type DemoLoginFormApi = ReturnType<typeof useDemoLoginForm>['form'];

export { useDemoLoginForm, DEMO_USERS, type DemoLoginFormApi, type DemoUser };
