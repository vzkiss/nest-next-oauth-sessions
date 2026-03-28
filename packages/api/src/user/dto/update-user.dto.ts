import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/** Profile update: only `name` and `image`; not `email` / `googleId`. */
export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['name', 'image'] as const)
) {}
