import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // Can be email or username

  @IsString()
  @MinLength(6)
  password: string;
}
