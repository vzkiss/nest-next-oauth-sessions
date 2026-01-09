import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [],
  controllers: [FeedbackController],
  providers: [],
})
export class FeedbackModule {}
