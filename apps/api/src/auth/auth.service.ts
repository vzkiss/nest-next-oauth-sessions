import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  async validateGoogleUser(googleUser: CreateUserDto): Promise<User> {
    const user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) return user;

    return await this.usersService.create(googleUser);
  }
}
