import { IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

// Security: Only allow updating safe fields (name, image)
// Prevent updating googleId or other sensitive fields
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  image?: string;
}
