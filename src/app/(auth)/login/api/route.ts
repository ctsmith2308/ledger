// import { loginCommand } from '@/modules/identity/application/login.command';
// import { LoginSchema } from '@/features/auth/model/login.schema';

export async function POST(req: Request) {
  // const body = await req.json();
  // const validated = LoginSchema.parse(body);

  // // Postman hits this: http://localhost:3000/login
  // const result = await loginCommand(validated);
  return Response.json({ data: 'yay!' });
}
