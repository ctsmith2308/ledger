import { Controller, Get } from '@nestjs/common';
// import { PrismaService } from '@/shared/infrastructure/persistence/prisma.service';

@Controller()
export class AppController {
  constructor() {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
