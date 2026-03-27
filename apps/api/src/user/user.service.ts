import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, UserDto } from '@repo/dto';

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
      image: googleUser.image,
    });
    return await this.userRepository.save(user);
  }

  // used by SessionGuard
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

  async update(id: string, updateUser: UpdateUserDto): Promise<UserDto> {
    await this.userRepository.update(id, {
      ...updateUser,
      image: updateUser.image ?? undefined,
    });
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
