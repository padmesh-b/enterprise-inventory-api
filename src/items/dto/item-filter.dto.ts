import { ApiPropertyOptional } from '@nestjs/swagger';
import { ItemStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CursorPaginationDto } from '../../common/dto/cursor-pagination.dto';

export class ItemFilterDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by item status', enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({ description: 'Search term for title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category (simulated as another string filter or if we had a category field, but for now we filter by sku/title conceptually. The specs mention category so we add it)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Minimum quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxQuantity?: number;
}
