import { Controller, Get, Post, Body, Param } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from '@/modules/identity/api/dtos';
import {
  RegisterUserCommand,
  GetUserProfileQuery,
} from '@/modules/identity/application';

@Controller('auth')
class IdentityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const result = await this.commandBus.execute(
      new RegisterUserCommand(dto.email, dto.password),
    );

    return result.getValueOrThrow();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetUserProfileQuery(id));

    return result.getValueOrThrow();
  }
}

export { IdentityController };
