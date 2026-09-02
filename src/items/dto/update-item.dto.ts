import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'MacBook Pro 16-inch M3', description: 'Updated item title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Detailed item description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Electronics', description: 'Item category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 20, description: 'Inventory stock quantity' })
  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ enum: ItemStatus, example: ItemStatus.IN_STOCK, description: 'Updated item stock status' })
  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
