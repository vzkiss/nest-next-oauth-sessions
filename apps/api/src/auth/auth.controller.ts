import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { User } from '../user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('validate/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    req.session.userId = user.id;

    const clientOrigin = this.configService.get<string>('client.origin');
    res.redirect(`${clientOrigin}/auth/callback`);
  }

  @Get('logout')
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
