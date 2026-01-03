import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private usersService: UserService
  ) {}

  // validate Google User
  async validateGoogleUser(profile: any): Promise<User> {
    console.log('TODO: implement');

    const { id, name, emails, photos } = profile;

    console.log(`[auth.service] ${photos}`);

    let user = await this.usersService.findOne(id);

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        googleId: id,
        email: emails[0].value,
        name: name,
        image: photos[0]?.value,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  // generate JWT
  generateJwt(user: any) {
    // TODO: generateJwt
    throw new Error('Method not implemented.');
  }
}
