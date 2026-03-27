import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { User } from '../user/user.entity';
import { CreateFeedbackDto } from '@repo/dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>
  ) {}

  async create(dto: CreateFeedbackDto, user: User): Promise<Feedback> {
    const feedback = this.feedbackRepository.create({
      message: dto.message,
      user,
    });

    return await this.feedbackRepository.save(feedback);
  }
}
