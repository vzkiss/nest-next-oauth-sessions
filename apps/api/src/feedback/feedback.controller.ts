// apps/api/src/feedback/feedback.controller.ts
import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('feedback')
export class FeedbackController {
  @Post()
  @UseGuards(AuthGuard('jwt'))
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
