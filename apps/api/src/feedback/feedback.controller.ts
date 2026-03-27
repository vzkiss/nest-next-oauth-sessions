import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from '@repo/dto';
import type { Request } from 'express';
import { User } from '../user/user.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(SessionGuard)
  @HttpCode(202)
  async submitFeedback(@Body() dto: CreateFeedbackDto, @Req() req: Request) {
    const user = req.user as User;
    const feedback = await this.feedbackService.create(dto, user);

    return { id: feedback.id, status: 'received' };
  }
}
