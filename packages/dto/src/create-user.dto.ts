import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  image?: string;

  @IsUUID()
  @IsNotEmpty()
  googleId!: string;
}
