import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}

  // validate Google User
  async validateGoogleUser(googleUser: CreateUserDto): Promise<User> {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) return user;

    return await this.usersService.create(googleUser);
  }

  // generate JWT
  generateJwt(user: any) {
    // TODO: generateJwt
    throw new Error('Method not implemented.');

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}
