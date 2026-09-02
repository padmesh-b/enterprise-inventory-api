import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ItemStatus } from '@prisma/client';

export class ItemResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;
  @ApiProperty({ example: 'LAPTOP-PRO-15' })
  sku!: string;
  @ApiProperty({ example: 'MacBook Pro 15-inch' })
  title!: string;
  @ApiPropertyOptional({ example: 'High performance laptop' })
  description!: string | null;
  @ApiPropertyOptional({ example: 'Electronics' })
  category!: string | null;
  @ApiProperty({ example: 15 })
  quantity!: number;
  @ApiProperty({ enum: ItemStatus, example: ItemStatus.IN_STOCK })
  status!: ItemStatus;
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  companyId!: string;
  @ApiProperty()
  createdAt!: Date;
  @ApiProperty()
  updatedAt!: Date;
}
