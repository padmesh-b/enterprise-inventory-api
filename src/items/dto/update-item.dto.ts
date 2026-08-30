import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  @IsOptional()
  quantity?: number;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
