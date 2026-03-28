import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto, User } from '../../../../packages/api/dist/entry';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateGoogleUser(googleUser: CreateUserDto): Promise<User> {
    const user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) return user;

    return await this.usersService.create(googleUser);
  }
}
