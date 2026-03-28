import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from '../../../../packages/api/dist/entry';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), UserModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
