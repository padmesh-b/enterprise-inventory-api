import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin@acmecorp.com', description: 'User email address' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User account password (min 8 chars)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @ApiProperty({ example: 'Acme Corp', description: 'Company / Tenant name' })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  companyName!: string;

  @ApiPropertyOptional({ example: 'acme-corp', description: 'Custom company URL slug' })
  @IsString()
  @IsOptional()
  companySlug?: string;
}
