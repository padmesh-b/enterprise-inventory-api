import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ItemStatus } from '@prisma/client';

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'MacBook Pro 16-inch M3', description: 'Updated item title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated product description', description: 'Updated item description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 25, description: 'Updated inventory stock quantity' })
  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ enum: ItemStatus, example: ItemStatus.IN_STOCK, description: 'Updated item stock status' })
  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
