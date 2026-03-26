import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('feedback')
export class FeedbackController {
  @Post()
  @UseGuards(SessionGuard)
  @HttpCode(202)
  async submitFeedback(@Body() data: { message: string }) {
    // In production: Publish to RabbitMQ queue - implemented under /apps/worker/
    // For demo: just log here
    console.log('[Feedback] Received:', data.message);

    // Simulate async processing
    setTimeout(() => {
      console.log('[Feedback] Processed:', data.message);
    }, 2000);
  }
}
