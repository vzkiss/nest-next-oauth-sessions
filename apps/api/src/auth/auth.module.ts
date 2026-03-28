import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleLoginGuard } from './guards/google-login.guard';
import { GoogleStrategy } from './strategies/google.srategy';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../packages/api/dist/entry';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GoogleLoginGuard],
})
export class AuthModule {}
