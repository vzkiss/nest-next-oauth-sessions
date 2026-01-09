import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  // - Handle login via `GET /auth/login/google` (public)
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Google OAuth flow
  }

  // - Handle login validation via `GET /auth/validate/google` (public) env.GOOGLE_CALLBACK_URL
  @Get('validate/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user as User;
    const token = this.authService.generateJwt(user);

    // Set HttpOnly cookie (can't be accessed by JavaScript)
    const isProduction =
      this.configService.get<string>('nodeEnv') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction, // Only send over HTTPS in production
      sameSite: 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with token
    const frontendUrl = this.configService.get<string>('frontend.url');

    console.log(`[googleAuthRedirect]: ${frontendUrl}`);

    // res.redirect(`${frontendUrl}/signin?token=${token}`); // debug
    res.redirect(`${frontendUrl}/auth/callback`);
  }

  // Optional: Logout endpoint
  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.json({ message: 'Logged out successfully' });
  }
}
