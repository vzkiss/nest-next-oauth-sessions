import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// All fields in UpdateUserDto (name, email) are now optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}
