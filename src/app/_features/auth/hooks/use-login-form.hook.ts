'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useForm } from '@tanstack/react-form';

import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { ROUTES } from '@/app/_shared/routes';

import { loginAction } from '@/app/_entities/identity/actions';

import {
  loginUserSchema,
  type LoginUserInput,
} from '@/app/_entities/identity/schema';

type DemoUser = {
  name: string;
  email: string;
  password: string;
};

const DEMO_USERS: DemoUser[] = [
  { name: 'Chris Smith', email: 'chris@ledger.app', password: 'Password@123!' },
  {
    name: 'Alice Rivera',
    email: 'alice@ledger.app',
    password: 'Password@123!',
  },
  { name: 'Ben Carter', email: 'ben@ledger.app', password: 'Password@123!' },
];

const useLoginForm = () => {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (input: LoginUserInput) =>
      handleActionResponse(loginAction(input)),
    onSuccess: (result) => {
      if (result?.challengeToken) {
        sessionStorage.setItem('mfa_challenge', result.challengeToken);
        router.push(ROUTES.mfa);
        return;
      }

      router.push(ROUTES.overview);
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

  return {
    form,
    formId: 'login-form',
    isPending,
    selectedUser,
    selectUser,
    demoUsers: DEMO_USERS,
  };
};

type LoginFormApi = ReturnType<typeof useLoginForm>['form'];

export { useLoginForm, DEMO_USERS, type LoginFormApi, type DemoUser };
