import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  // - Get: `GET /user/profile` (private)
  // - Update: `PUT /user/profile` (private)
}
