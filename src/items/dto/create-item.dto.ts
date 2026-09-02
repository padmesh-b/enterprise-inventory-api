import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class CreateItemDto {
  @ApiProperty({ example: 'LAPTOP-PRO-15', description: 'Unique Stock Keeping Unit per company' })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku!: string;

  @ApiProperty({ example: 'MacBook Pro 15-inch', description: 'Item title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  @ApiPropertyOptional({ example: 'High performance laptop for engineers', description: 'Detailed item description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Electronics', description: 'Item category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 15, description: 'Inventory stock quantity' })
  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity!: number;

  @ApiPropertyOptional({ enum: ItemStatus, example: ItemStatus.IN_STOCK, description: 'Item stock status' })
  @IsEnum(ItemStatus, { message: 'Invalid item status' })
  @IsOptional()
  status?: ItemStatus;
}
