import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto, User } from '@repo/api';
import { UserService } from './user.service';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(SessionGuard)
  async getProfile(@Req() req): Promise<User> {
    return req.user as User;
  }

  @Put('profile')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = req.user as User;
    return await this.userService.update(user.id, updateUserDto);
  }
}
