import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  // handle data returned from Google
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    // Validate profile data exists before accessing
    if (!profile || !profile.id) {
      return done(new Error('Invalid Google profile: missing id'), null);
    }

    if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
      return done(new Error('Invalid Google profile: missing email'), null);
    }

    if (!profile.name || !profile.name.givenName || !profile.name.familyName) {
      return done(new Error('Invalid Google profile: missing name'), null);
    }

    const googleUser: CreateUserDto = {
      googleId: profile.id,
      email: profile.emails[0].value,
      name: `${profile.name.givenName} ${profile.name.familyName}`,
      image: profile.photos?.[0]?.value, // Optional, safe access
    };

    try {
      const user = await this.authService.validateGoogleUser(googleUser);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
