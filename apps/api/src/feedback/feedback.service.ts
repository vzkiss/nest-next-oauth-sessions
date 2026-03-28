import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto, Feedback, User } from '@repo/api';

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
