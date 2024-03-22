import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() userData: { username: string; password: string },
  ): Promise<UserDTO> {
    const { username, password } = userData;
    return this.usersService.register(username, password);
  }

  @Post('login')
  async login(
    @Body() userData: { username: string; password: string },
  ): Promise<UserDTO | null> {
    const { username, password } = userData;
    return this.usersService.login(username, password);
  }
}
