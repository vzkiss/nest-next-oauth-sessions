import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(googleUser: CreateUserDto): Promise<User> {
    // Create new user
    const user = this.userRepository.create({
      googleId: googleUser.googleId,
      email: googleUser.email,
      name: googleUser.name,
      image: googleUser.image, // Fixed: was incorrectly using googleUser.name
    });
    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async findByGoogleId(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { googleId: id },
    });
  }

  async update(id: string, updateUser: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUser);
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
