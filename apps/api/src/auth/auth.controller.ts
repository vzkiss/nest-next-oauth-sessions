import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { User } from '@repo/api';
import { sanitizeRedirect } from '../common/safe-path.util';
import type { Request, Response } from 'express';
import { GoogleLoginGuard } from './guards/google-login.guard';

/** OAuth endpoints only: 5 requests per minute per IP (logout is excluded). */
@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AuthController {
  constructor(private configService: ConfigService) {}

  /**
   * Google OAuth Login handler
   *  - initiates the Google OAuth flow
   *  - redirects to the Google OAuth login page
   */
  @Get('login/google')
  @UseGuards(GoogleLoginGuard)
  async googleLogin() {}

  /**
   * Google OAauth Callback handler
   *  - sets the user session and redirects to the post-login path
   * @param req - The request object
   * @param res - The response object
   * @returns - The response
   */
  @Get('validate/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    req.session.userId = user.id;

    const clientOrigin = this.configService.get<string>('client.origin');
    const path = sanitizeRedirect(req.session.postLoginRedirect);
    delete req.session.postLoginRedirect;
    res.redirect(`${clientOrigin}${path}`);
  }

  /**
   * Logout handler
   *  - destroys the user session and redirects to the home page
   * @param req - The request object
   * @param res - The response object
   * @returns - The response
   */
  @Get('logout')
  @SkipThrottle()
  async logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  }
}
