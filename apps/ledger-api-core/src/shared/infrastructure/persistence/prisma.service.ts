import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

/**
 * PrismaService extends PrismaClient which passes the adapter - PrismaPg - to the PrismaClient.
 * see: https://www.prisma.io/docs/orm/core-concepts/supported-databases/database-drivers#driver-adapters
 * see: https://www.prisma.io/docs/orm/core-concepts/supported-databases/postgresql#using-driver-adapters
 * see: https://docs.nestjs.com/recipes/prisma#use-prisma-client-in-your-nestjs-services
 *
 * OnModuleEnit lifecycle hook class exposes onModuleInit method to wrap $connect call.
 * see: https://docs.nestjs.com/recipes/prisma#use-prisma-client-in-your-nestjs-services
 * see: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const prismaConfig = { connectionString: process.env.DATABASE_URL };

    const adapter = new PrismaPg(prismaConfig);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();

    console.log('Prisma connected to database');
  }
}
