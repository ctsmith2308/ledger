import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        service: 'core-api',
        db: 'connected',
      };
    } catch {
      return {
        status: 'error',
        service: 'core-api',
        db: 'unreachable',
      };
    }
  }
}
