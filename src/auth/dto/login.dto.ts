import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@acmecorp.com', description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User account password' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}
