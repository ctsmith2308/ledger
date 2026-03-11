import { Controller, Post, Body } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from '@/modules/identity/api';
import { RegisterUserCommand } from '@/modules/identity/application';

@Controller('auth')
class IdentityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus, // You'll need this for reads
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const userId = await this.commandBus.execute(
      new RegisterUserCommand(dto.email, dto.password),
    );

    return userId;
  }
}

export { IdentityController };

// TODO:
// @Get(':id')
// async getById(@Param('id') id: string) {
//   const user = await this.queryBus.execute(new GetUserProfileQuery(id));
//   return UserMapper.toResponse(user);
// }
