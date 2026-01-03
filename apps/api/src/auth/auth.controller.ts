import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  // - Handle login via `GET /auth/login/google` (public)
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req) {
    // Google OAuth flow
  }

  // - Handle login validation via `GET /auth/validate/google` (public) env.GOOGLE_CALLBACK_URL

  @Get('validate/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // This function is called upon successful authentication
    console.log(`req: ${req}`);

    const user = req.user;
    const token = this.authService.generateJwt(user);

    // Redirect to frontend with token
    const frontendUrl = this.configService.get<string>('frontend.url');
    res.redirect(`${frontendUrl}/signin?token=${token}`);
  }
}
