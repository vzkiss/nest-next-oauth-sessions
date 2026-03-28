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
import {
  type UserDto,
  UpdateUserDto,
  User,
} from '../../../../packages/api/dist/entry';
import { UserService } from './user.service';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @UseGuards(SessionGuard)
  async getProfile(@Req() req): Promise<UserDto> {
    return req.user as UserDto;
  }

  @Put('profile')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserDto> {
    const user = req.user as User;
    const updated = await this.userService.update(user.id, updateUserDto);
    return updated as UserDto;
  }
}
