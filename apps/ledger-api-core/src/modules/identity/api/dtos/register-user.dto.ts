import { IsEmail, IsString, MinLength } from 'class-validator';

class RegisterUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export { RegisterUserDto };
