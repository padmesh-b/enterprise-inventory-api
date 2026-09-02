import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, NotEquals } from 'class-validator';

export class AdjustmentDto {
  @ApiProperty({ example: 5, description: 'Quantity to add or remove (can be negative)' })
  @IsInt()
  @NotEquals(0)
  quantityChange!: number;

  @ApiProperty({ example: 'Stock recount', description: 'Reason for the adjustment' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
