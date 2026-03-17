import { IdentityService } from '@/core/modules/indentity/api/indentity.api';

export async function POST(req: Request) {
  const body = await req.json();
  const result = await IdentityService.registerUser(body, req.headers);

  if (result.isFailure) {
    return Response.json(result.error.toResponse(), { status: result.error.status });
  }

  return Response.json(result.value, { status: 200 });
}
