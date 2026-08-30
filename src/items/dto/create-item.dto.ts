import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity!: number;

  @IsEnum(ItemStatus, { message: 'Invalid item status' })
  @IsOptional()
  status?: ItemStatus;
}
