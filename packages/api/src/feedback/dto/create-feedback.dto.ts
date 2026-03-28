import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(5, { message: 'Feedback must be at least 5 characters' })
  @MaxLength(1000, { message: 'Feedback must be at most 1000 characters' })
  message: string;
}
