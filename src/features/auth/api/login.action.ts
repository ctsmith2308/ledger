'use server';
// import { loginCommand } from '../../../modules/identity/application/login.command';
// import { LoginSchema } from '../model/login.schema';

async function loginAction(formData: FormData) {
  // const rawData = Object.fromEntries(formData);
  // const validated = LoginSchema.parse(rawData);

  // // Call the Brain
  // return await loginCommand(validated);
  console.log('calling loginAction');
}

export { loginAction };
