import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  image?: string;

  @IsUUID()
  @IsNotEmpty()
  googleId: string;
}
