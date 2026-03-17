'use server';

import { redirect } from 'next/navigation';
import { IdentityService } from '@/core/modules/indentity/api/indentity.api';

async function registerAction(_prev: unknown, formData: FormData) {
  const body = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = await IdentityService.registerUser(body);

  if (result.isFailure) {
    return result.error.toResponse();
  }

  redirect('/login');
}

export { registerAction };
