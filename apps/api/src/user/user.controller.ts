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
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { User } from './user.entity';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(SessionGuard)
  async getProfile(@Req() req) {
    return req.user;
  }

  @Put('profile')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as User;
    return this.userService.update(user.id, updateUserDto);
  }
}
