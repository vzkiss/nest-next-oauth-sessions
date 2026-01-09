import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  // validate Google User
  async validateGoogleUser(googleUser: CreateUserDto): Promise<User> {
    const user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) return user;

    return await this.usersService.create(googleUser);
  }

  // generate JWT
  generateJwt(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000), // issued at
    };

    return this.jwtService.sign(payload);
  }

  // verify JWT manually if needed
  verifyJwt(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
    } catch (error) {
      console.log(`verifyJtw error: ${error}`);
      return null;
    }
  }
}
