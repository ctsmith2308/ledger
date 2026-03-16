'use server';

// import { a } from '@/modules/identity/application/login.command';
// import { LoginSchema } from '@/features/auth/model/login.schema';

async function loginAction(formData: FormData) {
  // const data = Object.fromEntries(formData);
  // const validated = LoginSchema.parse(data);
  // // Call the portable Brain
  // return await loginCommand.execute(validated);
  console.log('calling loginAction');
}

export { loginAction };
